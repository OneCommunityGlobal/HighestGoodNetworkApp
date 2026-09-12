import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

export const EventDetailsSection = () => {
  return (
    <header className="w-full h-12 flex items-center justify-between opacity-0 translate-y-[-1rem] animate-fade-in [--animation-delay:0ms]">
      <h1 className="font-semibold text-[32px] leading-[48px] tracking-[-0.32px] text-[#1c1e1c] [font-family:'Inter',Helvetica]">
        Event page
      </h1>

      <div className="flex items-center gap-4">
        <Select defaultValue="community-member">
          <SelectTrigger className="w-[214px] h-10 bg-white rounded-lg border border-[#e0e0e0] px-4 py-2 gap-4">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="community-member">
              <span className="font-presets-body2 font-[number:var(--presets-body2-font-weight)] text-[#828282] text-[length:var(--presets-body2-font-size)] tracking-[var(--presets-body2-letter-spacing)] leading-[var(--presets-body2-line-height)]">
                Community member
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Avatar className="w-10 h-10">
          <AvatarImage
            src="https://c.animaapp.com/mhkba7ef3J2kka/img/avatar.svg"
            alt="User avatar"
          />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
