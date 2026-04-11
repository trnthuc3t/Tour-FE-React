import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from './components';
import { AuthProvider } from './context';
import store from './store';
import router from './routes';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
