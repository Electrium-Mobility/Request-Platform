import { Button } from "./ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { X, CheckCircle2, ListChecks, Flag } from "lucide-react";
import { TaskStatus, TaskPriority } from "./TaskCard";

interface BatchOperationsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onSubteamChange: (subteam: string) => void;
  onPriorityChange: (priority: TaskPriority) => void;
}

export function BatchOperationsBar({
  selectedCount,
  onClearSelection,
  onStatusChange,
  onSubteamChange,
  onPriorityChange
}: BatchOperationsBarProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-slate-200 rounded-2xl px-8 py-6 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5 min-w-fit">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-slate-900">{selectedCount} task{selectedCount !== 1 ? 's' : ''} selected</div>
          <div className="text-slate-500">Apply changes to selection</div>
        </div>
      </div>
      
      <div className="h-14 w-px bg-slate-200" />
      
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-slate-600 px-1">Status</label>
          <Select onValueChange={onStatusChange}>
            <SelectTrigger className="w-[160px] h-10 bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-slate-500" />
                <SelectValue placeholder="Change status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-slate-600 px-1">Subteam</label>
          <Select onValueChange={onSubteamChange}>
            <SelectTrigger className="w-[160px] h-10 bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <SelectValue placeholder="Change team" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-slate-600 px-1">Priority</label>
          <Select onValueChange={onPriorityChange}>
            <SelectTrigger className="w-[160px] h-10 bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-slate-500" />
                <SelectValue placeholder="Set priority" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="h-14 w-px bg-slate-200" />
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onClearSelection}
        className="gap-2 h-10 px-4 hover:bg-slate-100 text-slate-600"
      >
        <X className="w-4 h-4" />
        Clear
      </Button>
    </div>
  );
}