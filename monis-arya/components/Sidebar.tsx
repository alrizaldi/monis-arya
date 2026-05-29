import { Link } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Patients', path: '/patients' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'Payers', path: '/payers' },
    { name: 'Submissions', path: '/submissions' },
    { name: 'Pending Monitor', path: '/pending' },
    { name: 'Audit Logs', path: '/audit' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">Insurance Monitor</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
              >
                <span className="mr-3">{/* Icon placeholder */}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;