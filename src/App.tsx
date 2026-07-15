import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useDemoStore } from '@/store/demoStore';
import { Presenter } from '@/components/presenter/Presenter';
import { Login } from '@/features/auth/Login';
import { CommandCentre } from '@/features/dashboard/CommandCentre';
import { MyWork } from '@/features/work/MyWork';
import { CreateInstruction } from '@/features/legislative/CreateInstruction';
import { BillWorkspace } from '@/features/legislative/BillWorkspace';
import { SearchPage } from '@/features/search/SearchPage';
import { SavedSearchesPage } from '@/features/search/SavedSearchesPage';
import { RecentResearchPage } from '@/features/search/RecentResearchPage';
import { ResearchCollectionsPage, ResearchCollectionPage } from '@/features/search/ResearchCollections';
import { Repository } from '@/features/repository/Repository';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import {
  DocumentArchivePage, OcrImportPage, ParticipationInboxPage, AnalyticsPage, AuditPage,
  HelpPage, VersionsPage, WorkflowPage, PublishPage,
} from '@/features/common/previewRoutes';
import { DraftingWorkspace } from '@/features/legislative/editor/DraftingWorkspace';
import { PublicHome, PublicBill, PublicParticipate, PublicTrack } from '@/features/public/PublicPortal';

function RootRedirect() {
  const role = useDemoStore((s) => s.currentRole);
  return <Navigate to={role && role !== 'citizen' ? '/dashboard' : '/login'} replace />;
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: 24, color: 'var(--text-strong)' }}>Page not found</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>The page you are looking for is not available.</p>
        <p style={{ marginTop: 16 }}><Link to="/dashboard" style={{ color: 'var(--green-700)', fontWeight: 600 }}>Return to the Command Centre</Link></p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Internal application */}
        <Route path="/dashboard" element={<CommandCentre />} />
        <Route path="/work" element={<MyWork />} />
        <Route path="/legislative/new" element={<CreateInstruction />} />
        <Route path="/legislative/:id" element={<BillWorkspace />} />
        <Route path="/legislative/:id/draft" element={<DraftingWorkspace key="draft" />} />
        <Route path="/legislative/:id/review" element={<DraftingWorkspace key="review" reviewRoute />} />
        <Route path="/legislative/:id/versions" element={<VersionsPage />} />
        <Route path="/legislative/:id/workflow" element={<WorkflowPage />} />
        <Route path="/legislative/:id/publish" element={<PublishPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/saved" element={<SavedSearchesPage />} />
        <Route path="/search/recent" element={<RecentResearchPage />} />
        <Route path="/repository" element={<Repository />} />
        <Route path="/repository/:collection" element={<Repository />} />
        <Route path="/research" element={<ResearchCollectionsPage />} />
        <Route path="/research/:collectionId" element={<ResearchCollectionPage />} />
        <Route path="/documents" element={<DocumentArchivePage />} />
        <Route path="/documents/import" element={<OcrImportPage />} />
        <Route path="/participation" element={<ParticipationInboxPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* Public portal */}
        <Route path="/public" element={<PublicHome />} />
        <Route path="/public/bills/:id" element={<PublicBill />} />
        <Route path="/public/bills/:id/participate" element={<PublicParticipate />} />
        <Route path="/public/track/:ref" element={<PublicTrack />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Presenter />
    </HashRouter>
  );
}
