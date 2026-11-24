// Renseignés au déploiement (L10) : URL du projet et clé publique (anon), jamais le rôle service.
const SUPABASE_URL = document.querySelector('meta[name=supabase-url]')?.content ?? ''
const CLE_ANON = document.querySelector('meta[name=supabase-anon]')?.content ?? ''

const message = document.getElementById('message')
const dire = (texte) => { message.textContent = texte }
const entetes = (jeton) => ({ 'Content-Type': 'application/json', apikey: CLE_ANON, Authorization: `Bearer ${jeton}` })

// Retour du lien e-mail : le jeton est dans le fragment d'URL.
const fragment = new URLSearchParams(location.hash.slice(1))
const jeton = fragment.get('access_token')
if (jeton) {
  history.replaceState(null, '', location.pathname)
  document.getElementById('etape-connexion').hidden = true
  document.getElementById('etape-suppression').hidden = false
}

document.getElementById('form-lien').addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value.trim()
  try {
    // GoTrue lit `redirect_to` dans la requête (pas dans le corps) ; l'URL doit figurer dans
    // `additional_redirect_urls` de la config Auth (supabase/config.toml), sinon repli sur site_url.
    const redirection = encodeURIComponent(location.href.split('#')[0])
    await fetch(`${SUPABASE_URL}/auth/v1/otp?redirect_to=${redirection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CLE_ANON },
      body: JSON.stringify({ email, create_user: false }),
    })
    // Réponse 4xx (e-mail inconnu, limite) ignorée : message neutre, l'existence du compte n'est pas révélée.
    dire('Si un compte existe pour cette adresse, un lien vient de vous être envoyé.')
  } catch {
    dire('Une erreur est survenue. Veuillez réessayer dans quelques instants.')
  }
})

const champ = document.getElementById('confirmation')
const bouton = document.getElementById('bouton-supprimer')
champ.addEventListener('input', () => { bouton.disabled = champ.value !== 'SUPPRIMER' })

document.getElementById('form-suppression').addEventListener('submit', async (e) => {
  e.preventDefault()
  bouton.disabled = true
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/supprimer-compte`, {
      method: 'POST',
      headers: entetes(jeton),
      body: JSON.stringify({ confirmation: 'SUPPRIMER' }),
    })
    if (r.status !== 202) throw new Error()
    document.getElementById('etape-suppression').hidden = true
    dire('Votre compte et toutes vos recettes ont été supprimés.')
  } catch {
    bouton.disabled = false
    dire('La suppression a échoué. Veuillez réessayer ; votre compte n\'a pas été modifié.')
  }
})
