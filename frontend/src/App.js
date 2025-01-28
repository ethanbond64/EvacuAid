import React from 'react';
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { FormPage } from "./pages/FormPage";
import { MapPage } from "./pages/MapPage";
import { InboxPage } from "./pages/InboxPage";
import { DetailPage } from "./pages/DetailPage";
import { SignPage } from "./pages/SignPage";
import { MidSignPage } from "./pages/MidSignPage";
import { MidSignHelperPage } from "./pages/MidSignHelperPage";
import { SuccessPage } from './pages/SuccessPage';

export const App = () => {
  return (
    <Routes>
      <Route path="/"
        element={<LoginPage />}
      />
      <Route
        path="/form"
        element={<FormPage />}
      />
      <Route
        path="/map"
        element={<MapPage />}
      />
      <Route
        path="/inbox/:userId"
        element={<InboxPage />}
      />
      <Route
        path="/detail"
        element={<DetailPage />}
      />
      <Route
        path="/sign"
        element={<SignPage />}
      />
      <Route
        path="/midSign"
        element={<MidSignPage />}
      />
      <Route
        path="/midsignhelper"
        element={<MidSignHelperPage />}
      />
      <Route
        path="/success"
        element={<SuccessPage />}
      />
      <Route
        path="*"
        element={<LoginPage />}
      />
    </Routes>
  );
};

export default App;