import styles from './loading.module.less'

export default function Loading() {
  return (
    <div className={styles.board}>
      {[1, 2, 3].map(i => (
        <div key={i} className={styles.column}>
          <div className={styles.colHeader} />
          {[1, 2, 3].map(j => (
            <div key={j} className={styles.card} />
          ))}
        </div>
      ))}
    </div>
  )
}
