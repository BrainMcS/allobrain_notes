// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <Link to="/" className="font-bold text-2xl">
          Versioned Notes
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <Link to="/notes/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
