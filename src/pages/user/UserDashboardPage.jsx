import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaBell,
  FaChartLine,
  FaClipboardList,
  FaHandshake,
  FaUsers,
} from 'react-icons/fa'
import Badge from '../../components/common/Badge'
import Card from '../../components/common/Card'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import {
  formatCurrency,
  formatDate,
  getPriorityColor,
  getStatusColor,
} from '../../utils/helpers'
import '../admin/SalesDashboard.css'

const UserDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    accounts,
    deals,
    tasks,
    notifications,
    supportRequests,
  } = useData()

  const stats = useMemo(() => {
    const pendingTasks = tasks.filter((task) => task.status === 'pending')
    const openDeals = deals.filter((deal) => !['won', 'lost'].includes(String(deal.status || '').toLowerCase()))
    const openSupportRequests = supportRequests.filter((supportRequest) => String(supportRequest.status || '').toLowerCase() !== 'closed')

    return {
      accounts: accounts.length,
      deals: deals.length,
      dealValue: deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0),
      openDeals: openDeals.length,
      tasks: tasks.length,
      pendingTasks: pendingTasks.length,
      supportRequests: supportRequests.length,
      openSupportRequests: openSupportRequests.length,
      notifications: notifications.length,
    }
  }, [accounts, deals, notifications.length, supportRequests, tasks])

  const recentDeals = useMemo(() => (
    [...deals]
      .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
      .slice(0, 5)
  ), [deals])

  const upcomingTasks = useMemo(() => (
    tasks
      .filter((task) => task.status !== 'completed')
      .sort((left, right) => new Date(left.dueDate || left.createdAt || 0).getTime() - new Date(right.dueDate || right.createdAt || 0).getTime())
      .slice(0, 5)
  ), [tasks])

  const latestNotifications = useMemo(() => (
    [...notifications]
      .sort((left, right) => new Date(right.timestamp || 0).getTime() - new Date(left.timestamp || 0).getTime())
      .slice(0, 5)
  ), [notifications])

  return (
    <div className="sales-dashboard">
      <div className="sales-header-wrapper">
        <div className="sales-header">
          <div className="sales-header-content">
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name || 'User'}! Here&apos;s your live work summary.</p>
          </div>
        </div>
      </div>

      <div className="sales-stats-grid">
        <div className="sales-stat-card">
          <div className="stat-icon stat-icon-blue">
            <FaUsers />
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.accounts}</div>
            <div className="stat-label">Accounts</div>
            <div className="stat-subtext">Assigned to you</div>
          </div>
        </div>

        <div className="sales-stat-card">
          <div className="stat-icon stat-icon-green">
            <FaHandshake />
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.openDeals}</div>
            <div className="stat-label">Open Deals</div>
            <div className="stat-subtext">{formatCurrency(stats.dealValue)} pipeline</div>
          </div>
        </div>

        <div className="sales-stat-card">
          <div className="stat-icon stat-icon-red">
            <FaClipboardList />
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.pendingTasks}</div>
            <div className="stat-label">Pending Tasks</div>
            <div className="stat-subtext">{stats.tasks} total tasks</div>
          </div>
        </div>

        <div className="sales-stat-card">
          <div className="stat-icon stat-icon-purple">
            <FaBell />
          </div>
          <div className="stat-details">
            <div className="stat-value">{stats.notifications}</div>
            <div className="stat-label">Notifications</div>
            <div className="stat-subtext">{stats.openSupportRequests} active support requests</div>
          </div>
        </div>
      </div>

      <div className="sales-content-grid">
        <Card className="sales-card" padding={false}>
          <div className="card-header">
            <h3>Recent Deals</h3>
            <button type="button" className="view-all-btn" onClick={() => navigate('/deals')}>
              View All {'->'}
            </button>
          </div>
          <div className="deals-table">
            <div className="table-header">
              <div className="col-name">Deal Name</div>
              <div className="col-value">Value</div>
              <div className="col-stage">Stage</div>
              <div className="col-date">Date</div>
            </div>
            {recentDeals.length > 0 ? recentDeals.map((deal) => (
              <div key={deal.id} className="table-row">
                <div className="col-name">{deal.name || '-'}</div>
                <div className="col-value">{formatCurrency(deal.value || 0)}</div>
                <div className="col-stage">
                  <Badge variant={getStatusColor(deal.status)}>
                    {deal.status || '-'}
                  </Badge>
                </div>
                <div className="col-date">{formatDate(deal.createdAt)}</div>
              </div>
            )) : (
              <div className="empty-state">No deals available</div>
            )}
          </div>
        </Card>

        <Card className="sales-card" padding={false}>
          <div className="card-header">
            <h3>Upcoming Tasks</h3>
            <button type="button" className="view-all-btn" onClick={() => navigate('/tasks')}>
              View All {'->'}
            </button>
          </div>
          <div className="high-value-deals">
            {upcomingTasks.length > 0 ? upcomingTasks.map((task) => (
              <div key={task.id} className="high-value-item">
                <div className="deal-info">
                  <div className="deal-name">{task.title}</div>
                  <div className="deal-account">{task.description || 'No description'}</div>
                </div>
                <div className="deal-middle">
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority || 'medium'}
                  </Badge>
                </div>
                <div className="deal-value">
                  <div className="value">{task.status || '-'}</div>
                  <div className="date">{task.dueDate ? formatDate(task.dueDate) : '-'}</div>
                </div>
              </div>
            )) : (
              <div className="empty-state">No upcoming tasks</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="sales-card full-width" padding={false}>
        <div className="card-header">
          <h3>Live Notifications</h3>
          <span className="deal-count">{latestNotifications.length} items</span>
        </div>
        <div className="high-value-deals">
          {latestNotifications.length > 0 ? latestNotifications.map((notification) => (
            <div key={notification.id} className="high-value-item">
              <div className="deal-info">
                <div className="deal-name">{notification.title || 'Notification'}</div>
                <div className="deal-account">{notification.message || '-'}</div>
              </div>
              <div className="deal-middle">
                <Badge variant={getStatusColor(notification.type === 'error' ? 'lost' : notification.type)}>
                  {notification.type || 'info'}
                </Badge>
              </div>
              <div className="deal-value">
                <div className="value">{notification.type || 'info'}</div>
                <div className="date">{formatDate(notification.timestamp)}</div>
              </div>
            </div>
          )) : (
            <div className="empty-state">No notifications yet</div>
          )}
        </div>
      </Card>

      <div className="quick-actions">
        <button type="button" className="action-btn action-btn-primary" onClick={() => navigate('/accounts/new')}>
          <FaChartLine /> Add Account
        </button>
        <button type="button" className="action-btn action-btn-secondary" onClick={() => navigate('/support-requests/add')}>
          <FaBell /> Add Support Request
        </button>
        <button type="button" className="action-btn action-btn-secondary" onClick={() => navigate('/quotation-manager/view')}>
          <FaClipboardList /> View Quotations
        </button>
      </div>
    </div>
  )
}

export default UserDashboardPage
