import React from "react";
import "./loader.css";

// interface LoaderProps {
//   loading: boolean;
// }

const Loader: React.FC = () => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
