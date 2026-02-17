import React from "react";
import { AlertTriangle, Home, ArrowLeft, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const GITHUB_ISSUES_URL = "https://github.com/Archetypically/MWICombatSimulator/issues";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            timestamp: null,
            isCopied: false,
            isDetailsOpen: false,
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            timestamp: new Date().toISOString(),
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            errorInfo,
        });
    }

    handleCopyDetails = () => {
        const { error, errorInfo, timestamp } = this.state;
        const details = [
            "=== Error Details ===",
            `Time: ${timestamp}`,
            `Error: ${error?.message || "Unknown error"}`,
            `Stack: ${error?.stack || "No stack trace"}`,
            `Component Stack: ${errorInfo?.componentStack || "No component stack"}`,
            "",
            "Please include these details when reporting this issue.",
        ].join("\n");

        navigator.clipboard.writeText(details).then(() => {
            this.setState({ isCopied: true });
            setTimeout(() => this.setState({ isCopied: false }), 2000);
        });
    };

    handleGoBack = () => {
        window.history.back();
    };

    handleGoHome = () => {
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorDisplay
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    timestamp={this.state.timestamp}
                    isCopied={this.state.isCopied}
                    isDetailsOpen={this.state.isDetailsOpen}
                    onCopyDetails={this.handleCopyDetails}
                    onToggleDetails={() => this.setState((s) => ({ isDetailsOpen: !s.isDetailsOpen }))}
                    onGoBack={this.handleGoBack}
                    onGoHome={this.handleGoHome}
                />
            );
        }

        return this.props.children;
    }
}

function ErrorDisplay({
    error,
    errorInfo,
    timestamp,
    isCopied,
    isDetailsOpen,
    onCopyDetails,
    onToggleDetails,
    onGoBack,
    onGoHome,
}) {
    const errorMessage = error?.message || "An unexpected error occurred";
    const stack = error?.stack || "";
    const componentStack = errorInfo?.componentStack || "";

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-muted-foreground">
                        We encountered an unexpected error. This might be a temporary issue or something we need to fix.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" onClick={onGoBack} className="flex-1 gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </Button>
                        <Button onClick={onGoHome} className="flex-1 gap-2">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-3">
                            Found a bug? Help us fix it by reporting this issue on GitHub.
                        </p>
                        <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer" className="block">
                            <Button variant="secondary" className="w-full">
                                Report on GitHub
                            </Button>
                        </a>
                    </div>

                    <Collapsible open={isDetailsOpen} onOpenChange={onToggleDetails}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground">
                                <span>Technical Details</span>
                                {isDetailsOpen ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 pt-2">
                            <p className="text-xs text-muted-foreground">
                                Copy the details below and include them in your bug report:
                            </p>
                            <div className="bg-muted p-3 rounded-md font-mono text-xs max-h-48 overflow-auto">
                                <div className="font-semibold mb-1">Time:</div>
                                <div className="mb-3">{timestamp}</div>
                                <div className="font-semibold mb-1">Error:</div>
                                <div className="mb-3 whitespace-pre-wrap">{errorMessage}</div>
                                <div className="font-semibold mb-1">Stack:</div>
                                <div className="mb-3 whitespace-pre-wrap text-wrap break-all">
                                    {stack || "No stack trace available"}
                                </div>
                                <div className="font-semibold mb-1">Component Stack:</div>
                                <div className="whitespace-pre-wrap text-wrap break-all">
                                    {componentStack || "No component stack available"}
                                </div>
                            </div>
                            <Button onClick={onCopyDetails} variant="outline" size="sm" className="w-full gap-2">
                                {isCopied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy Details
                                    </>
                                )}
                            </Button>
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>
        </div>
    );
}

export default ErrorBoundary;
