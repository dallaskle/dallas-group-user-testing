import React from 'react';
//import { AdminDashboard } from '../components/AdminDashboard';
import { AdminDashboard } from './AdminDashboard';

const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminPage; 