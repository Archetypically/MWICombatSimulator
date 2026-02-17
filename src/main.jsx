import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { DataProvider } from "./contexts/DataLoadingContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ErrorBoundary>
            <DataProvider>
                <App />
            </DataProvider>
        </ErrorBoundary>
    </React.StrictMode>,
);
