const { getMongoModel, getNextLegacyId } = require('../models/mongoModels')
const { AppError } = require('../utils/appError')
const leadRepository = require('../repositories/leadRepository')
const { assertRecordAccess, isPrivilegedRole, toNumberOrNull } = require('../security/accessScope')

const Remark = getMongoModel('remarks')
const RemarkReminder = getMongoModel('remark_reminders')
const User = getMongoModel('users')
const AuditLog = getMongoModel('audit_log')

const byLegacyId = (id) => {
  const numericId = toNumberOrNull(id)
  if (numericId === null) return { _id: null }
  return {
    $or: [
      { legacyId: numericId },
      { id: numericId },
    ],
  }
}
const toNumber = toNumberOrNull

const mapReminder = (reminder) => {
  if (!reminder) return null
  return {
    ...reminder,
    id: reminder.legacyId ?? reminder.id,
    remark_id: reminder.remarkId,
    remarkId: reminder.remarkId,
    reminder_date: reminder.reminderDate,
    reminder_time: reminder.reminderTime,
    assigned_to: reminder.assignedTo,
    reminder_note: reminder.reminderNote,
    is_completed: Boolean(reminder.isCompleted),
    company_id: reminder.companyId,
    owner_user_id: reminder.ownerUserId,
    created_at: reminder.createdAt,
    updated_at: reminder.updatedAt,
  }
}

const mapRemark = async (remark) => {
  if (!remark) return null
  const createdBy = remark.createdBy ?? remark.created_by
  const user = createdBy ? await User.findOne(byLegacyId(createdBy)).lean() : null

  return {
    ...remark,
    id: remark.legacyId ?? remark.id,
    account_id: remark.accountId,
    accountId: remark.accountId,
    created_by: createdBy,
    createdBy,
    created_by_name: user?.name || user?.username || '',
    createdByName: user?.name || user?.username || '',
    company_id: remark.companyId,
    companyId: remark.companyId,
    owner_user_id: remark.ownerUserId,
    ownerUserId: remark.ownerUserId,
    project_id: remark.projectId,
    workflow_id: remark.workflowId,
    assignment_mode: remark.assignmentMode,
    assigned_user_ids: remark.assignedUserIds || [],
    assigned_user_types: remark.assignedUserTypes || [],
    assigned_user_groups: remark.assignedUserGroups || [],
    created_at: remark.createdAt,
    updated_at: remark.updatedAt,
  }
}

class RemarkService {
  async getAccessibleLead(accountId, actor) {
    const lead = leadRepository.findLeadByIdForActor
      ? await leadRepository.findLeadByIdForActor(accountId, actor, { companyWide: isPrivilegedRole(actor?.role) })
      : await leadRepository.findLeadById(accountId)

    if (!lead) {
      throw new AppError('Account not found or not accessible', 404)
    }

    return lead
  }

  async getRemarkById(remarkId, actor) {
    const remark = await mapRemark(await Remark.findOne({
      ...byLegacyId(remarkId),
      companyId: actor.companyId || 1,
    }).lean())

    if (!remark) {
      throw new AppError('Remark not found', 404)
    }

    assertRecordAccess(actor, remark, 'remark')
    return remark
  }

  async getReminderById(reminderId, actor) {
    const reminder = mapReminder(await RemarkReminder.findOne({
      ...byLegacyId(reminderId),
      companyId: actor.companyId || 1,
    }).lean())

    if (!reminder) {
      throw new AppError('Reminder not found', 404)
    }

    assertRecordAccess(actor, reminder, 'remark reminder')
    return reminder
  }

  formatReminderNote(reminder = {}) {
    const detailLines = [
      reminder.actionType ? `Action: ${reminder.actionType}` : '',
      reminder.priority ? `Priority: ${reminder.priority}` : '',
      reminder.status ? `Status: ${reminder.status}` : '',
      reminder.followupType ? `Followup Type: ${reminder.followupType}` : '',
    ].filter(Boolean)
    const note = String(reminder.note || '').trim()
    if (detailLines.length === 0) return note
    return note ? `${detailLines.join('\n')}\n\n${note}` : detailLines.join('\n')
  }

  normalizeAssignment(assignment = {}) {
    const allowedModes = new Set(['user', 'type', 'group'])
    const mode = allowedModes.has(assignment.mode) ? assignment.mode : null
    const normalizeList = (value) => (
      Array.isArray(value)
        ? Array.from(new Set(value.map((entry) => String(entry || '').trim()).filter(Boolean)))
        : []
    )

    return {
      mode,
      userIds: normalizeList(assignment.userIds || assignment.selectedUserIds || assignment.expandedUserIds),
      userTypes: normalizeList(assignment.userTypes || assignment.selectedUserTypes),
      userGroups: normalizeList(assignment.userGroups || assignment.selectedUserGroups),
    }
  }

  async createRemark(remarkData) {
    const { actor, accountId, category = 'general', content, createdBy, reminder } = remarkData
    const assignment = this.normalizeAssignment(remarkData.assignment)
    if (!actor || !accountId || !content) {
      throw new AppError('Account ID and content are required', 400)
    }

    const lead = await this.getAccessibleLead(accountId, actor)
    const legacyId = await getNextLegacyId('remarks')
    const companyId = actor.companyId || lead.companyId || 1
    const now = new Date()

    const remark = await Remark.create({
      legacyId,
      accountId: toNumber(accountId),
      category,
      content,
      createdBy,
      companyId,
      ownerUserId: actor.id,
      projectId: lead.projectId || null,
      workflowId: remarkData.workflowId || lead.workflowId || null,
      assignmentMode: assignment.mode,
      assignedUserIds: assignment.userIds,
      assignedUserTypes: assignment.userTypes,
      assignedUserGroups: assignment.userGroups,
      createdAt: now,
      updatedAt: now,
    })

    if (reminder && reminder.date && reminder.time && reminder.assignedTo) {
      await RemarkReminder.create({
        legacyId: await getNextLegacyId('remark_reminders'),
        remarkId: legacyId,
        reminderDate: reminder.date,
        reminderTime: reminder.time,
        assignedTo: toNumber(reminder.assignedTo),
        reminderNote: this.formatReminderNote(reminder),
        closeOldReminders: Boolean(reminder.closeOldReminders),
        isCompleted: false,
        createdBy,
        companyId,
        ownerUserId: toNumber(reminder.assignedTo || actor.id),
        projectId: lead.projectId || null,
        workflowId: remarkData.workflowId || lead.workflowId || null,
        createdAt: now,
        updatedAt: now,
      })
    }

    await this.logAudit({
      actorId: createdBy,
      companyId,
      action: 'CREATE',
      entityType: 'remark',
      entityId: String(legacyId),
      changes: { content, category, assignment },
    })

    return mapRemark(remark.toObject())
  }

  async getRemarksByAccount(accountId, actor) {
    await this.getAccessibleLead(accountId, actor)
    const remarks = await Remark
      .find({ accountId: toNumber(accountId), companyId: actor.companyId || 1 })
      .sort({ createdAt: -1, legacyId: -1 })
      .lean()

    const mappedRemarks = []
    for (const remark of remarks) {
      const mappedRemark = await mapRemark(remark)
      const reminders = await RemarkReminder.find({ remarkId: mappedRemark.id, companyId: actor.companyId || 1 }).lean()
      mappedRemarks.push({
        ...mappedRemark,
        reminders: reminders.map(mapReminder),
      })
    }

    return mappedRemarks
  }

  async updateRemark(remarkId, updateData) {
    const { actor, content, category, createdBy } = updateData
    await this.getRemarkById(remarkId, actor)
    const updates = { updatedAt: new Date() }
    if (content !== undefined) updates.content = content
    if (category !== undefined) updates.category = category

    const updatedRemark = await Remark.findOneAndUpdate(
      { ...byLegacyId(remarkId), companyId: actor.companyId || 1 },
      { $set: updates },
      { new: true }
    ).lean()

    if (!updatedRemark) {
      throw new AppError('Remark not found', 404)
    }

    await this.logAudit({
      actorId: createdBy,
      companyId: actor.companyId || 1,
      action: 'UPDATE',
      entityType: 'remark',
      entityId: String(remarkId),
      changes: { content, category },
    })

    return mapRemark(updatedRemark)
  }

  async deleteRemark(remarkId, actor) {
    await this.getRemarkById(remarkId, actor)
    await RemarkReminder.deleteMany({ remarkId: toNumber(remarkId), companyId: actor.companyId || 1 })
    await Remark.deleteOne({ ...byLegacyId(remarkId), companyId: actor.companyId || 1 })
    await this.logAudit({
      actorId: actor.id,
      companyId: actor.companyId || 1,
      action: 'DELETE',
      entityType: 'remark',
      entityId: String(remarkId),
    })
    return { success: true, message: 'Remark deleted successfully' }
  }

  async createReminder(reminderId, updateData) {
    const { actor, isCompleted } = updateData
    await this.getReminderById(reminderId, actor)
    const updatedReminder = await RemarkReminder.findOneAndUpdate(
      { ...byLegacyId(reminderId), companyId: actor.companyId || 1 },
      { $set: { isCompleted, updatedAt: new Date() } },
      { new: true }
    ).lean()

    if (!updatedReminder) {
      throw new AppError('Reminder not found', 404)
    }

    return mapReminder(updatedReminder)
  }

  async logAudit(auditData) {
    const { actorId, companyId, action, entityType, entityId, changes } = auditData
    try {
      await AuditLog.create({
        legacyId: await getNextLegacyId('audit_log'),
        actorId,
        companyId: companyId || 1,
        action,
        entityType,
        entityId,
        changes: changes || {},
        createdAt: new Date(),
      })
    } catch (_error) {
      // Audit logging should never block user-facing CRM actions.
    }
  }

  canSeeRemark(actor, remark) {
    if (!actor) return false
    if (isPrivilegedRole(actor.role)) return true
    return (
      remark.ownerUserId === actor.id
      || remark.createdBy === actor.id
      || !remark.assignmentMode
      || (Array.isArray(remark.assignedUserIds) && remark.assignedUserIds.includes(String(actor.id)))
    )
  }

  async getRemarksHistory(accountId, limit = 50, offset = 0, actor = null) {
    await this.getAccessibleLead(accountId, actor)
    const baseFilter = { accountId: toNumber(accountId), companyId: actor.companyId || 1 }
    const records = await Remark
      .find(baseFilter)
      .sort({ createdAt: -1, legacyId: -1 })
      .skip(Math.max(0, Number(offset) || 0))
      .limit(Math.max(1, Number(limit) || 50))
      .lean()

    const visibleRecords = records.filter((remark) => this.canSeeRemark(actor, remark))
    const remarks = []
    for (const remark of visibleRecords) {
      remarks.push(await mapRemark(remark))
    }

    return {
      remarks,
      total: await Remark.countDocuments(baseFilter),
    }
  }
}

module.exports = new RemarkService()
