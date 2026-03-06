import { contactService } from '@/entities/contact'
import type { CreateContactDto, UpdateContactDto } from '@/entities/contact'
import type { Contact } from '@/entities/contact'

const noop = () => {}
const noopAsync = async () => {}

export function useContactsCrud(
  getWorkspaceId: () => string,
  fetchContacts: () => Promise<void> = noopAsync,
  clearSelection: () => void = noop,
) {
  const createContact = async (data: CreateContactDto): Promise<Contact> => {
    const workspaceId = getWorkspaceId()
    if (!workspaceId) throw new Error('Workspace not selected')
    const contact = await contactService.create(workspaceId, data)
    await fetchContacts()
    return contact
  }

  const updateContact = async (id: string, data: UpdateContactDto): Promise<Contact> => {
    const workspaceId = getWorkspaceId()
    if (!workspaceId) throw new Error('Workspace not selected')
    const contact = await contactService.update(workspaceId, id, data)
    await fetchContacts()
    return contact
  }

  const deleteContact = async (id: string): Promise<void> => {
    const workspaceId = getWorkspaceId()
    if (!workspaceId) throw new Error('Workspace not selected')
    await contactService.delete(workspaceId, id)
    clearSelection()
    await fetchContacts()
  }

  return {
    createContact,
    updateContact,
    deleteContact,
  }
}
