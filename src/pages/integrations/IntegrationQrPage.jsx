import React from 'react'
import { useParams } from 'react-router-dom'
import { FaEnvelope, FaExternalLinkAlt, FaQrcode, FaWhatsapp } from 'react-icons/fa'
import Button from '../../components/common/Button'
import './IntegrationQrPage.css'

const INTEGRATIONS = [
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    mode: 'WhatsApp Web QR',
    url: 'https://web.whatsapp.com/',
    icon: FaWhatsapp,
  },
  {
    key: 'outlook',
    name: 'Outlook',
    mode: 'Outlook Web',
    url: 'https://outlook.office.com/mail/',
    icon: FaEnvelope,
  },
]

const buildQrUrl = (value) => (
  `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(value)}`
)

const IntegrationQrPage = () => {
  const { channel } = useParams()
  const normalizedChannel = String(channel || '').toLowerCase()
  const selectedIntegration = INTEGRATIONS.find((integration) => integration.key === normalizedChannel)
  const cards = selectedIntegration ? [selectedIntegration] : INTEGRATIONS
  const pageTitle = selectedIntegration ? `${selectedIntegration.name} QR` : 'WhatsApp and Outlook QR'

  return (
    <section className="integration-qr-page">
      <div className="integration-qr-header">
        <div className="integration-qr-header__icon">
          <FaQrcode />
        </div>
        <div>
          <span className="integration-qr-kicker">Active Integrations</span>
          <h1>{pageTitle}</h1>
        </div>
      </div>

      <div className={`integration-qr-grid${selectedIntegration ? ' integration-qr-grid--single' : ''}`}>
        {cards.map((integration) => {
          const IntegrationIcon = integration.icon

          return (
            <article
              key={integration.key}
              className={`integration-qr-card integration-qr-card--${integration.key}`}
            >
              <div className="integration-qr-card__top">
                <span className="integration-qr-card__icon">
                  <IntegrationIcon />
                </span>
                <div>
                  <span className="integration-qr-card__status">Active</span>
                  <h2>{integration.name}</h2>
                  <p>{integration.mode}</p>
                </div>
              </div>

              <div className="integration-qr-code">
                <img
                  src={buildQrUrl(integration.url)}
                  alt={`${integration.name} QR code`}
                />
              </div>

              <Button
                type="button"
                variant="primary"
                size="medium"
                fullWidth
                icon={<FaExternalLinkAlt />}
                onClick={() => window.open(integration.url, '_blank', 'noopener,noreferrer')}
              >
                Open {integration.name}
              </Button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default IntegrationQrPage
