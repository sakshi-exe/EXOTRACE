import { PageHeading } from '../../components/common/PageHeading'
import { EmptyState } from '../../components/common/DataStates'

export default function NotFoundPage() {
  return <main className="page-content">
    <PageHeading eyebrow="EXOTRACE / NAVIGATION" title="PAGE NOT FOUND" subtitle="No investigation view is registered at this address." />
    <EmptyState title="Unknown route" detail="Use the mission navigation to return to an available workspace view." />
  </main>
}