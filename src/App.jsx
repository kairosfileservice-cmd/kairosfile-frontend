import { useState } from 'react';
import { Header } from './components/Header';
import { UploadPage } from './pages/UploadPage';
import { FilesPage } from './pages/FilesPage';

function App() {
  const [page, setPage] = useState('upload');

  return (
    <div className="flex flex-col" style={{ height: '100svh' }}>
      <Header page={page} onChangePage={setPage} />
      <div className="flex-1 min-h-0">
        {page === 'upload' ? <UploadPage /> : <FilesPage />}
      </div>
    </div>
  );
}

export default App;
