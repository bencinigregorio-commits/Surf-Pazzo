import { Icon } from './Icons'

// Pulsante che apre una ricerca YouTube: usa il termine specifico se c'è,
// altrimenti cerca per nome. Si apre in una nuova scheda.
export default function VideoButton({ term, name }) {
  const q = (term && term.trim()) || name
  if (!q) return null
  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q)
  return (
    <a className="vidbtn" href={url} target="_blank" rel="noreferrer">
      <Icon name="play" size={13} /> Video
    </a>
  )
}
