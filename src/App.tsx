import { useState, useEffect } from 'react';
import { StudentInterface } from './components/StudentInterface';
import { AdminInterface } from './components/AdminInterface';
import { Button } from './components/ui/button';
import { Users, Settings } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'student' | 'admin'>('student');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if the current user is the admin
    const studentName = localStorage.getItem('tcf-student-name');
    setIsAdmin(studentName === 'Yann@5645');
  }, []);

  // Listen for changes in student name to update admin status
  useEffect(() => {
    const handleStorageChange = () => {
      const studentName = localStorage.getItem('tcf-student-name');
      setIsAdmin(studentName === 'Yann@5645');
    };

    const handleStudentNameChange = () => {
      const studentName = localStorage.getItem('tcf-student-name');
      setIsAdmin(studentName === 'Yann@5645');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tcf-student-name-change', handleStudentNameChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tcf-student-name-change', handleStudentNameChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">TCF Canada 100% de Reussite Chez Monsieur Yannick</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={currentView === 'student' ? 'default' : 'outline'}
                onClick={() => setCurrentView('student')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Étudiant
              </Button>
              {isAdmin && (
                <Button
                  variant={currentView === 'admin' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('admin')}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === 'student' ? <StudentInterface /> : <AdminInterface />}
      </main>
    </div>
  );
}