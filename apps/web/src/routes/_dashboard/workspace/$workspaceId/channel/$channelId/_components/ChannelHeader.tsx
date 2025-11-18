import { ModeToggle } from "@/components/mode-toggle";

export function ChannelHeader() {
  return (
    <div className="flex items-center justify-between h-14 px-4 border-b">
      <h2 className="text-xl font-semibold">#LOADING</h2>
      <div className="flex items-center space-x-2">
        <ModeToggle />
      </div>
    </div>
  );
}
