import {useContext} from 'react'
import {SnappingContext} from '@/pages'
import styles from '@/styles/Components.module.sass'

export default function Components() {
    const [snapping, setSnapping] = useContext(SnappingContext) // Whether snapping is enabled

    return (
        <div className={styles.container}>
            <button onClick={() => setSnapping(!snapping.current)}
                    title="If enabled, wire joints are automatically aligned when they are close to each other.">
                {snapping.current ? 'Disable' : 'Enable'} Snapping
            </button>
        </div>
    )
}