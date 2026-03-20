import Sidebar from '@/components/layout/Sidebar/Sidebar'
import BottomNav from '@/components/layout/BottomNav/BottomNav'
import { ToastProvider } from '@/components/ui/Toast/Toast'
import PageTransition from './PageTransition'
import styles from './layout.module.less'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.content}>
          <PageTransition>
            {children}
          </PageTransition>
        </div>
        <BottomNav />
      </div>
    </ToastProvider>
  )
}
