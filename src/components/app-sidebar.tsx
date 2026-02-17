"use client";

import * as React from "react";
import { Link, useLocation } from "react-router-dom";

import { HeartIcon } from "@/components/ui/heart";
import { LinkIcon } from "@/components/ui/link";
import { SettingsIcon } from "@/components/ui/settings";
import { BookTextIcon } from "@/components/ui/book-text";
import { UserIcon } from "@/components/ui/user";
import { ChartSplineIcon } from "@/components/ui/chart-spline";
import { ChevronRightIcon } from "@/components/ui/chevron-right";
import { UserRoundPlusIcon } from "@/components/ui/user-round-plus";
import { HistoryIcon } from "@/components/ui/history";
import { TrophyIcon } from "@/components/ui/trophy";

import {
    Sidebar,
    SidebarTrigger,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "./ui/separator";

const SLOT_COUNT = 5;
const SLOT_KEY_PREFIX = "character_slot_";

function useCharacterSlotData() {
    const [slotData, setSlotData] = React.useState(() => {
        const data: Record<number, { name: string; isActive: boolean }> = {};
        for (let i = 1; i <= SLOT_COUNT; i++) {
            const stored = localStorage.getItem(`${SLOT_KEY_PREFIX}${i}`);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    // Check if slot is "active" (has meaningful data)
                    const isActive =
                        parsed.player?.equipment?.length > 0 ||
                        parsed.player?.attackLevel > 1 ||
                        parsed.player?.rangedLevel > 1 ||
                        parsed.player?.magicLevel > 1 ||
                        parsed.player?.meleeLevel > 1;
                    data[i] = {
                        name: parsed.name || `Slot ${i}`,
                        isActive,
                    };
                } catch (e) {
                    data[i] = { name: `Slot ${i}`, isActive: false };
                }
            } else {
                data[i] = { name: `Slot ${i}`, isActive: false };
            }
        }
        return data;
    });

    React.useEffect(() => {
        const handleStorageChange = () => {
            const data: Record<number, { name: string; isActive: boolean }> = {};
            for (let i = 1; i <= SLOT_COUNT; i++) {
                const stored = localStorage.getItem(`${SLOT_KEY_PREFIX}${i}`);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        const isActive =
                            parsed.player?.equipment?.length > 0 ||
                            parsed.player?.attackLevel > 1 ||
                            parsed.player?.rangedLevel > 1 ||
                            parsed.player?.magicLevel > 1 ||
                            parsed.player?.meleeLevel > 1;
                        data[i] = {
                            name: parsed.name || `Slot ${i}`,
                            isActive,
                        };
                    } catch (e) {
                        data[i] = { name: `Slot ${i}`, isActive: false };
                    }
                } else {
                    data[i] = { name: `Slot ${i}`, isActive: false };
                }
            }
            setSlotData(data);
        };

        // Listen for custom character name change events
        const handleCharacterNameChange = (event: CustomEvent) => {
            const { slotNumber, name } = event.detail;
            setSlotData((prev) => ({
                ...prev,
                [slotNumber]: { ...prev[slotNumber], name: name || `Slot ${slotNumber}` },
            }));
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("characterNameChanged", handleCharacterNameChange as EventListener);

        // Poll for changes every second to catch updates from same window
        const interval = setInterval(handleStorageChange, 1000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("characterNameChanged", handleCharacterNameChange as EventListener);
            clearInterval(interval);
        };
    }, []);

    return slotData;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation();
    const slotData = useCharacterSlotData();

    const leftIconSize = 16;

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2 p-1">
                    <Link to="/" className="flex-1">
                        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center cursor-pointer hover:bg-sidebar-accent/50 rounded-lg transition-colors">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <img src="/assets/logo.webp" alt="MWI Logo" className="size-8 object-contain" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden font-pixel">
                                <span className="truncate font-semibold">MWI Combat Simulator</span>
                                <span className="truncate text-xs">by Archetypically</span>
                            </div>
                        </div>
                    </Link>
                    <SidebarTrigger className="group-data-[collapsible=icon]:mx-auto" />
                </div>
            </SidebarHeader>
            <Separator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={location.pathname === "/" || location.pathname === "/simulator"}
                                >
                                    <Link to="/">
                                        <ChartSplineIcon size={leftIconSize} />
                                        <span>Simulator</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/optimizer"}>
                                    <Link to="/optimizer">
                                        <TrophyIcon size={leftIconSize} />
                                        <span>Optimizer</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/history"}>
                                    <Link to="/history">
                                        <HistoryIcon size={leftIconSize} />
                                        <span>History</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <Collapsible asChild defaultOpen className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip="Characters"
                                            isActive={location.pathname.startsWith("/characters")}
                                        >
                                            <UserIcon size={leftIconSize} />
                                            <span>Characters</span>
                                            <ChevronRightIcon
                                                size={leftIconSize}
                                                className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                                            />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {[1, 2, 3, 4, 5].map((slotNum) => {
                                                const isActive = slotData[slotNum]?.isActive;
                                                const isSelected = location.pathname === `/characters/${slotNum}`;
                                                return (
                                                    <SidebarMenuSubItem key={slotNum}>
                                                        <SidebarMenuSubButton asChild isActive={isSelected}>
                                                            <Link to={`/characters/${slotNum}`}>
                                                                {isActive ? (
                                                                    <UserIcon
                                                                        size={leftIconSize}
                                                                        className={
                                                                            isSelected
                                                                                ? "text-blue-500"
                                                                                : "text-green-500"
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <UserRoundPlusIcon
                                                                        size={leftIconSize}
                                                                        className="text-muted-foreground"
                                                                    />
                                                                )}
                                                                <span>
                                                                    {slotData[slotNum]?.name || `Slot ${slotNum}`}
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/settings"}>
                                    <Link to="/settings">
                                        <SettingsIcon size={leftIconSize} />
                                        <span>Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a
                                        href="https://github.com/Archetypically/MWICombatSimulator/blob/main/CHANGELOG.md"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <BookTextIcon size={leftIconSize} />
                                        <span>Patch Notes</span>
                                        <LinkIcon size={12} className="ml-auto opacity-50" />
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <Separator />
            <SidebarFooter>
                <div className="group-data-[collapsible=icon]:hidden flex flex-col items-center justify-center gap-1 p-2 text-xs text-muted-foreground/50 whitespace-nowrap font-pixel">
                    <div className="flex items-center gap-1">
                        <span>Made with</span>
                        <HeartIcon size={12} className="text-red-500/70" />
                        <span>by</span>
                        <a
                            href="https://evanlee.engineer"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-foreground font-medium transition-colors"
                        >
                            Archetypically
                        </a>
                    </div>
                    <span className="text-[10px]">© 2026</span>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
