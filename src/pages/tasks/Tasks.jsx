import React, { useEffect, useState } from 'react'
import { FaBell } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useModal } from '../../hooks'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import Table from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import AddReminderModal from '../../components/common/AddReminderModal'
import {
  getStandaloneReminders,
  subscribeStandaloneReminders,
  closeStandaloneReminder,
  reopenStandaloneReminder,
  deleteStandaloneReminder,
} from '../../features/standaloneReminders/standaloneReminderStorage'
import { formatDate, getPriorityColor } from '../../utils/helpers'
import { TASK_STATUS, PRIORITY_LEVELS } from '../../utils/constants'
import './Tasks.css'

const Tasks = () => {
  const { tasks, createTask, updateTask, deleteTask, addNotification } = useData()
  const { user } = useAuth()
  const { isOpen, data, open, close } = useModal()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: ''
  })

  const [reminders, setReminders] = useState(() => getStandaloneReminders())
  const [addReminderOpen, setAddReminderOpen] = useState(false)

  useEffect(() => subscribeStandaloneReminders(setReminders), [])

  const userTasks = tasks

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = data 
      ? await updateTask(data.id, formData)
      : await createTask(formData)

    if (result.success) {
      addNotification('success', 'Success', `Task ${data ? 'updated' : 'created'} successfully`)
      close()
      resetForm()
    }
  }

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || ''
    })
    open(task)
  }

  const handleDelete = async (task) => {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      await deleteTask(task.id)
      addNotification('success', 'Deleted', 'Task deleted successfully')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: ''
    })
  }

  const handleCloseReminder = (id) => {
    closeStandaloneReminder(id, user?.name || '')
  }

  const handleReopenReminder = (id) => {
    reopenStandaloneReminder(id)
  }

  const handleDeleteReminder = (id) => {
    if (window.confirm('Delete this reminder?')) {
      deleteStandaloneReminder(id)
    }
  }

  const formatReminderDate = (dateStr, time) => {
    if (!dateStr) return '–'
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    const formatted = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    return time ? `${formatted} ${time}` : formatted
  }

  const columns = [
    { key: 'title', label: 'Task' },
    { 
      key: 'priority', 
      label: 'Priority',
      width: '120px',
      render: (value) => (
        <Badge variant={getPriorityColor(value)}>{value}</Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      width: '120px',
      render: (value) => (
        <Badge variant={value === 'completed' ? 'success' : 'warning'}>{value}</Badge>
      )
    },
    { 
      key: 'dueDate', 
      label: 'Due Date',
      width: '150px',
      render: (value) => value ? formatDate(value) : '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      render: (_, row) => (
        <div className="table-actions">
          <Button size="small" variant="outline" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button size="small" variant="danger" onClick={() => handleDelete(row)}>
            Delete
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="tasks-page">
      <Card
        title="Tasks"
        subtitle={`${userTasks.length} tasks`}
        actions={
          <Button onClick={() => { resetForm(); open(); }}>
            + Add Task
          </Button>
        }
      >
        <Table
          columns={columns}
          data={userTasks}
          emptyMessage="No tasks found"
        />
      </Card>

      {/* ── Linked Reminders Panel ── */}
      <div className="tasks-reminders-section">
        <div className="tasks-reminders-header">
          <div className="tasks-reminders-title">
            <FaBell />
            Linked Reminders
            <span className="tasks-reminders-badge">
              {reminders.filter((r) => r.status === 'active').length} active
            </span>
          </div>
          <button
            type="button"
            className="tasks-reminders-add-btn"
            onClick={() => setAddReminderOpen(true)}
          >
            <FaBell />
            + Add Reminder
          </button>
        </div>

        <div className="tasks-reminders-list">
          {reminders.length === 0 ? (
            <p className="tasks-reminders-empty">
              No reminders yet. Click "+ Add Reminder" to create one — it will also appear on the Calendar.
            </p>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`tasks-reminder-card${reminder.status === 'closed' ? ' tasks-reminder-card--closed' : ''}`}
              >
                <FaBell className="tasks-reminder-icon" />
                <div className="tasks-reminder-main">
                  <div className="tasks-reminder-title">
                    {reminder.title}
                    <span className="tasks-reminder-mode">{reminder.reminderMode}</span>
                  </div>
                  <div className="tasks-reminder-meta">
                    {formatReminderDate(reminder.reminderDate, reminder.reminderTime)}
                    {reminder.note ? ` · ${reminder.note}` : ''}
                    {reminder.status === 'closed' && ' · Closed'}
                  </div>
                </div>
                <div className="tasks-reminder-actions">
                  {reminder.status === 'active' ? (
                    <button
                      type="button"
                      className="tasks-reminder-btn tasks-reminder-btn--close"
                      onClick={() => handleCloseReminder(reminder.id)}
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="tasks-reminder-btn tasks-reminder-btn--reopen"
                      onClick={() => handleReopenReminder(reminder.id)}
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    type="button"
                    className="tasks-reminder-btn tasks-reminder-btn--delete"
                    onClick={() => handleDeleteReminder(reminder.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={data ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleSubmit} className="task-form">
          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            fullWidth
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
          />

          <Select
            label="Priority *"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={PRIORITY_LEVELS}
            required
            fullWidth
          />

          <Select
            label="Status *"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={TASK_STATUS}
            required
            fullWidth
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            fullWidth
          />

          <div className="modal-actions">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {data ? 'Update' : 'Create'} Task
            </Button>
          </div>
        </form>
      </Modal>

      <AddReminderModal
        isOpen={addReminderOpen}
        onClose={() => setAddReminderOpen(false)}
        createdBy={user?.name || ''}
      />
    </div>
  )
}

export default Tasks

