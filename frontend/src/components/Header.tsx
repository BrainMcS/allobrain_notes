import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <Link to="/" className="font-bold text-2xl">
          Versioned Notes
        </Link>
      </div>
    </header>
  );
};

export default Header;
