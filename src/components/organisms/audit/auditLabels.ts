/** Acción de auditoría en palabras; las desconocidas se muestran con su código. */
export const auditActionLabels: Record<string, string> = {
  'auth.login': 'Inició sesión',
  'auth.login_failed': 'Intento de inicio fallido',
  'auth.password_changed': 'Cambió su contraseña',
  'auth.mfa_enabled': 'Activó el doble factor',
  'auth.mfa_disabled': 'Desactivó el doble factor',
  'auth.external_linked': 'Vinculó una cuenta externa',
  'auth.external_unlinked': 'Desvinculó una cuenta externa',
  'user.created': 'Creó un usuario',
  'user.updated': 'Modificó un usuario',
  'user.password_reset': 'Cambió la contraseña de un usuario',
  'user.deleted': 'Eliminó un usuario',
  'recording.played': 'Escuchó una grabación',
  'recording.deleted': 'Eliminó una grabación',
  'message.shared': 'Compartió un recado',
  'message.public_viewed': 'Se abrió un recado por enlace',
  'message.deleted': 'Eliminó un recado',
  'settings.changed': 'Cambió la configuración',
  'mcp_token.created': 'Creó un token MCP',
  'mcp_token.changed': 'Cambió permisos de un token MCP',
  'mcp_token.revoked': 'Revocó un token MCP',
  'campaign.started': 'Inició una campaña',
  'campaign.paused': 'Pausó una campaña',
  'campaign.deleted': 'Eliminó una campaña',
  'campaign.contacts_imported': 'Importó contactos',
  'retention.purged': 'Borrado automático por retención',
}

export const auditGroups: { value: string; label: string }[] = [
  { value: '', label: 'Todo' },
  { value: 'auth.', label: 'Accesos' },
  { value: 'user.', label: 'Usuarios' },
  { value: 'recording.', label: 'Grabaciones' },
  { value: 'message.', label: 'Recados' },
  { value: 'settings.', label: 'Configuración' },
  { value: 'mcp_token.', label: 'Tokens MCP' },
  { value: 'campaign.', label: 'Campañas' },
  { value: 'retention.', label: 'Retención' },
]

/** Acciones que conviene resaltar al revisar (fallos y borrados). */
export const sensitiveActions = new Set(['auth.login_failed', 'user.deleted', 'recording.deleted', 'message.deleted', 'mcp_token.revoked', 'auth.mfa_disabled'])
