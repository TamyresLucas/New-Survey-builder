import React from 'react';

const Connector: React.FC = () => (
    <div className="relative w-48 flex-shrink-0 flex items-center" aria-hidden="true">
        <div className="w-full h-0.5 bg-primary" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-primary" />
    </div>
);

export default Connector;
