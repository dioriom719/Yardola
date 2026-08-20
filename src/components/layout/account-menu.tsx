"use client";

import Link from "next/link";
import { User, Bookmark, ClipboardList, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/(auth)/actions";

export function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="gap-1.5">
            <User />
            My YARDOLO
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem render={<Link href="/account" />}>
          <User />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/saved" />}>
          <Bookmark />
          Saved Projects
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/plans" />}>
          <ClipboardList />
          My Plans
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/settings" />}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem
            variant="destructive"
            render={<button type="submit" className="w-full" />}
          >
            <LogOut />
            Sign Out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
