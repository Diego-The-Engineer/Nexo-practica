import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, ArrowDownUp, Trash2, Save, Mail, Phone } from 'lucide-react'
import { get, post, patch, remove, messageOf } from '../services/api'
import { searchContacts } from '../utils/format'
import { PageTitle, Loading, ErrorState, Empty, Modal, Avatar } from '../components/UI'
import { useNotify } from '../context/NotificationContext'

function ContactRow({ contact, onDelete, onUpdate }) {
  const [company, setCompany] = useState(contact.company)
  return (
    <tr>
      <td>
        <div className="contact-name">
          <Avatar person={contact} />
          <strong>{contact.name}</strong>
        </div>
      </td>
      <td>
        <div className="inline-edit">
          <input
            aria-label={`Empresa de ${contact.name}`}
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
          <button
            className="icon-button"
            aria-label={`Guardar empresa de ${contact.name}`}
            onClick={() => onUpdate(contact.id, company)}
          >
            <Save size={14} />
          </button>
        </div>
      </td>
      <td>
        <a href={`mailto:${contact.email}`}>
          <Mail size={13} />
          {contact.email}
        </a>
        <small>
          <Phone size={12} />
          {contact.phone || 'Sin teléfono'}
        </small>
      </td>
      <td>
        <button
          className="icon-button delete"
          aria-label={`Eliminar ${contact.name}`}
          onClick={() => onDelete(contact)}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  )
}
export default function Contacts() {
  const contacts = useQuery({ queryKey: ['contacts'], queryFn: () => get('/contacts') })
  const [search, setSearch] = useState('')
  const [descending, setDescending] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const client = useQueryClient()
  const notify = useNotify()
  const visible = searchContacts(contacts.data || [], search).sort((a, b) =>
    descending ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name),
  )
  async function save(event) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await post('/contacts', form)
      await client.invalidateQueries({ queryKey: ['contacts'] })
      setCreating(false)
      setForm({ name: '', company: '', email: '', phone: '' })
      notify('Contacto guardado')
    } catch (error) {
      setError(messageOf(error))
    } finally {
      setPending(false)
    }
  }
  async function destroy() {
    try {
      await remove(`/contacts/${selected.id}`)
      client.invalidateQueries({ queryKey: ['contacts'] })
      notify('Contacto eliminado')
    } catch (error) {
      notify(messageOf(error), 'error')
    } finally {
      setSelected(null)
    }
  }
  async function update(id, company) {
    client.setQueryData(['contacts'], (old) =>
      old.map((contact) => (contact.id === id ? { ...contact, company } : contact)),
    )
    try {
      await patch(`/contacts/${id}`, { company })
      notify('Empresa actualizada')
    } catch (error) {
      notify(messageOf(error), 'error')
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="RELACIONES QUE IMPORTAN"
        title="Nuestra red"
        description="Las personas y organizaciones con las que construimos."
      >
        <button className="button" onClick={() => setCreating(true)}>
          <Plus size={18} />
          Nuevo contacto
        </button>
      </PageTitle>
      <div className="toolbar">
        <div className="search-input wide">
          <Search size={17} />
          <input
            aria-label="Buscar contactos"
            placeholder="Buscar por nombre, empresa o correo…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <button className="button secondary" onClick={() => setDescending(!descending)}>
          <ArrowDownUp size={15} />
          Nombre {descending ? 'Z–A' : 'A–Z'}
        </button>
      </div>
      <section className="panel table-panel">
        {contacts.isPending ? (
          <Loading />
        ) : contacts.error ? (
          <ErrorState error={contacts.error} retry={contacts.refetch} />
        ) : visible.length ? (
          <table>
            <thead>
              <tr>
                <th>PERSONA</th>
                <th>ORGANIZACIÓN</th>
                <th>CONTACTO</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((contact, index) => (
                <ContactRow
                  key={index}
                  contact={contact}
                  onDelete={setSelected}
                  onUpdate={update}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <Empty
            title="No encontramos contactos"
            text="Prueba otra búsqueda o añade una nueva persona."
          />
        )}
      </section>
      <p className="result-count">{visible.length} contactos en tu red</p>
      {creating && (
        <Modal
          title="Una nueva conexión"
          subtitle="Guarda los datos para seguir en contacto."
          onClose={() => setCreating(false)}
        >
          <form className="form" onSubmit={save}>
            {[
              ['name', 'Nombre completo', 'text'],
              ['company', 'Organización', 'text'],
              ['email', 'Correo electrónico', 'email'],
              ['phone', 'Teléfono', 'tel'],
            ].map(([name, label, type]) => (
              <label key={name}>
                {label}
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                  required={name === 'name' || name === 'email'}
                />
              </label>
            ))}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={pending}>
              Guardar contacto
            </button>
          </form>
        </Modal>
      )}
      {selected && (
        <Modal
          title={`¿Eliminar a ${selected.name}?`}
          subtitle="Este contacto dejará de aparecer en la red del equipo."
          onClose={() => setSelected(null)}
        >
          <div className="form-actions">
            <button className="button secondary" onClick={() => setSelected(null)}>
              Cancelar
            </button>
            <button className="button danger" onClick={destroy}>
              Eliminar contacto
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}