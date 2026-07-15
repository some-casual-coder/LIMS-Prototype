import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { Placeholder } from '@/routes/Placeholder';

// Route skeleton for the whole prototype. Screens are filled in per phase;
// the internal shell and public shell wrappers are added with the design pass.
export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to={paths.login} replace />} />

        {/* Entry / identity */}
        <Route path={paths.login} element={<Placeholder title="Sign in" phase="Phase 1 (design pass)" />} />

        {/* Internal application */}
        <Route path={paths.dashboard} element={<Placeholder title="Command Centre" phase="Phase 2" />} />
        <Route path={paths.work} element={<Placeholder title="My Work" phase="Phase 2" />} />
        <Route path={paths.legislativeNew} element={<Placeholder title="Create Legislative Instruction" phase="Phase 2" />} />
        <Route path="/legislative/:id" element={<Placeholder title="Bill Workspace" phase="Phase 2" />} />
        <Route path="/legislative/:id/draft" element={<Placeholder title="Structured Drafting Workspace" phase="Phase 2" />} />
        <Route path="/legislative/:id/versions" element={<Placeholder title="Version History and Comparison" phase="Phase 2" />} />
        <Route path="/legislative/:id/workflow" element={<Placeholder title="Workflow and Approvals" phase="Phase 2" />} />
        <Route path="/legislative/:id/publish" element={<Placeholder title="Signature, Seal and Publication" phase="Phase 2" />} />
        <Route path={paths.search} element={<Placeholder title="Search and Knowledge Explorer" phase="Phase 3" />} />
        <Route path={paths.documents} element={<Placeholder title="Document Archive" phase="Phase 4" />} />
        <Route path={paths.documentsImport} element={<Placeholder title="OCR Import and Verification" phase="Phase 4" />} />
        <Route path={paths.participation} element={<Placeholder title="Public Participation Inbox" phase="Phase 3" />} />
        <Route path={paths.analytics} element={<Placeholder title="Clerk's Analytics Dashboard" phase="Phase 4" />} />
        <Route path={paths.audit} element={<Placeholder title="Audit and Compliance Explorer" phase="Phase 4" />} />
        <Route path={paths.notifications} element={<Placeholder title="Notifications Centre" phase="Phase 4" />} />

        {/* Public portal */}
        <Route path={paths.publicHome} element={<Placeholder title="Public Portal" phase="Phase 3" />} />
        <Route path="/public/bills/:id" element={<Placeholder title="Public Bill Page" phase="Phase 3" />} />
        <Route path="/public/bills/:id/participate" element={<Placeholder title="Citizen Submission" phase="Phase 3" />} />
        <Route path="/public/track/:ref" element={<Placeholder title="Track Submission" phase="Phase 3" />} />

        <Route path="*" element={<Placeholder title="Page not found" phase="review" />} />
      </Routes>
    </HashRouter>
  );
}
