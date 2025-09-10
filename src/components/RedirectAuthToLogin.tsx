import { Navigate, useLocation } from 'react-router-dom';

export const RedirectAuthToLogin = () => {
  const location = useLocation();
  
  return (
    <Navigate 
      to={`/login${location.search}${location.hash}`} 
      replace 
    />
  );
};