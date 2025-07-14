import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ResetPass from './pages/ResetPass';
import PaginaPrincipal from './pages/PaginaPrincipal';
import Detalle from './pages/Detalle';
import ModalResenaWrapper from './pages/ModalResenaWrapper';
import ConfirmarOrden from './pages/Confirmarorden';
import AdminJuegos from './pages/AdminJuegos';
import AgregarJuego from './pages/AgregarJuego';
import EditarJuegos from './pages/EditarJuego';
import EliminarJuego from './pages/EliminarJuego';
import AdminNoticias from './pages/AdminNoticias';
import AgregarNoticia from './pages/AgregarNoticia';
import EditarNoticia from './pages/EditarNoticia';
import EliminarNoticia from './pages/EliminarNoticia';
import EditarUsuario from './pages/EditarUsuario';

import MasVendidos from './pages/MasVendidos';
import MejorValorados from './pages/MejorValorados';



createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/PW-frontend">
      <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/resetpass" element={<ResetPass />} />
      <Route path="/paginaprincipal" element={<PaginaPrincipal />} />
      <Route path="/resena/:id" element={<ModalResenaWrapper />} />



      <Route path="/detalle/:id" element={<Detalle />} />
      <Route path="/confirmarorden" element={<ConfirmarOrden />} />
      <Route path="/masvendidos" element={<MasVendidos />} />
      <Route path="/mejorvalorados" element={<MejorValorados />} />


      {/* Juegos */}
      <Route path="/adminjuegos" element={<AdminJuegos />} />
      <Route path="/agregarjuego" element={<AgregarJuego onClose={() => {}} />} />
      <Route
        path="/editarjuego/:id"
        element={
          <EditarJuegos
            juego={{
              id: 0,
              nombre: '',
              descripcion: '',
              precio: 0,
              imagenes: [],
              estaOferta: false,
              estado: false,
              categoriaId: 0,
              videoUrl: '',
              plataformas: [],
            }}
            onSave={() => {}}
          />
        }
      />
      <Route
        path="/eliminarjuego/:id"
        element={
          <EliminarJuego
            id={0}
            juego=" "
            onClose={() => {}}
            onDeleted={() => {}}
          />
        }
      />

      {/* Noticias */}
      <Route path="/adminnoticias" element={<AdminNoticias />} />
      <Route path="/adminnoticias/agregar" element={<AgregarNoticia onClose={() => {}} />} />
      <Route
        path="/adminnoticias/editar/:id"
        element={
          <EditarNoticia
            noticia={{
              id: 0,
              titulo: '',
              contenido: '',
              imagenes: [],
              activo: false,
            }}
            onSave={() => {}}
          />
        }
      />
      <Route
        path="/adminnoticias/eliminar/:id"
        element={
          <EliminarNoticia
            id={0}
            titulo=" "
            onClose={() => {}}
            onDeleted={() => {}}
          />
        }
      />
      <Route path="/editarusuario" element={<EditarUsuario />} />
    </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
