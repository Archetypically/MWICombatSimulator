import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useSimulator } from "./hooks/useSimulator";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SimulationHistoryProvider } from "@/contexts/SimulationHistoryContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Simulator from "./pages/Simulator";
import SimulatorRunView from "./pages/SimulatorRunView";
import History from "./pages/History";
import Characters from "./pages/Characters";
import Settings from "./pages/Settings";
import Optimizer from "./pages/Optimizer";
import OptimizerRunView from "./pages/OptimizerRunView";
import PixelBlast from "@/components/PixelBlast";

function MobileMenuButton() {
    const isMobile = useIsMobile();
    const { setOpenMobile } = useSidebar();

    if (!isMobile) return null;

    return (
        <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
            onClick={() => setOpenMobile(true)}
            aria-label="Open menu"
        >
            <Menu className="size-6" />
        </Button>
    );
}

function AppContent() {
    const location = useLocation();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-transparent">
                <MobileMenuButton />
                <div className="min-h-screen p-4 md:p-8 space-y-6 pt-16 md:pt-8">
                    <div className="absolute inset-0" style={{ zIndex: -1 }}>
                        <PixelBlast
                            variant="square"
                            pixelSize={4}
                            color={isDark ? "#2e3969" : "#c5d0e8"}
                            patternScale={2}
                            patternDensity={1}
                            enableRipples
                            rippleSpeed={0.3}
                            rippleThickness={0.1}
                            rippleIntensityScale={1}
                            speed={0.3}
                            transparent
                            edgeFade={0.36}
                        />
                    </div>
                    <Routes>
                        <Route path="/" element={<Simulator />} />
                        <Route path="/simulator" element={<Simulator />} />
                        <Route path="/simulator/:uuid" element={<SimulatorRunView />} />
                        <Route path="/optimizer" element={<Optimizer />} />
                        <Route path="/optimizer/:uuid" element={<OptimizerRunView />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/characters" element={<Navigate to="/characters/1" replace />} />
                        <Route path="/characters/:slotNumber" element={<Characters />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <SimulationHistoryProvider>
                <Router>
                    <AppContent />
                    <Toaster />
                </Router>
            </SimulationHistoryProvider>
        </ThemeProvider>
    );
}
