import React from 'react';
import { Provider } from 'react-redux';
import AppRoutes from './routes';
import { store } from './store';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TriggerContainer } from '../components/Tooltip';

const App = () => {
  return (
    <>
      <TriggerContainer>
        <Provider store={store}>
          <AppRoutes />
        </Provider>
      </TriggerContainer>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App
