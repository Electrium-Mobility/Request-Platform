import { useDrag } from 'react-dnd';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { GripVertical, Calendar, Heart, MessageCircle, Paperclip } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  likes?: number;
  comments?: number;
  attachments?: number;
}

export function TaskCard({ 
  id, 
  title, 
  description, 
  columnId, 
  priority = 'medium',
  dueDate,
  assignee,
  tags = [],
  likes: initialLikes = 0,
  comments = 0,
  attachments = 0
}: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id, columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    high: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  const priorityGlow = {
    low: 'shadow-blue-500/20',
    medium: 'shadow-amber-500/20',
    high: 'shadow-rose-500/30',
  };

  const cardBorderColors = {
    low: 'border-l-blue-500',
    medium: 'border-l-amber-500',
    high: 'border-l-rose-500',
  };

  const isOverdue = dueDate && new Date(dueDate) < new Date();

  return (
    <div
      ref={drag}
      className={`cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-40 scale-95 rotate-2' : 'opacity-100 hover:scale-[1.02]'
      }`}
    >
      <Card className={`p-3.5 bg-gray-800/80 backdrop-blur-md hover:bg-gray-800/90 border-l-4 ${cardBorderColors[priority]} border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-xl ${priorityGlow[priority]} group`}>
        <div className="flex gap-2.5">
          <GripVertical className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />
          <div className="flex-1 min-w-0 space-y-2.5">
            {/* Title and Priority */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="flex-1 text-sm text-gray-100 group-hover:text-white transition-colors leading-snug">{title}</h3>
              <Badge className={`${priorityColors[priority]} text-xs px-2 py-0.5 border backdrop-blur-sm`}>
                {priority}
              </Badge>
            </div>

            {/* Description */}
            {description && (
              <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{description}</p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="text-xs px-2.5 py-1 bg-gray-700/50 backdrop-blur-sm text-gray-300 rounded-full border border-gray-600/30 hover:border-gray-500/50 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer with metadata */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
              <div className="flex items-center gap-3">
                {/* Due Date */}
                {dueDate && (
                  <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md backdrop-blur-sm transition-colors ${
                    isOverdue 
                      ? 'text-red-300 bg-red-500/10 border border-red-500/20' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}

                {/* Likes */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all hover:scale-110 ${
                    isLiked 
                      ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' 
                      : 'text-gray-500 hover:text-rose-400 hover:bg-rose-500/5'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''} transition-all`} />
                  <span>{likes}</span>
                </button>

                {/* Comments */}
                {comments > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 transition-colors px-2 py-1 rounded-md hover:bg-gray-700/30">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{comments}</span>
                  </div>
                )}

                {/* Attachments */}
                {attachments > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 transition-colors px-2 py-1 rounded-md hover:bg-gray-700/30">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{attachments}</span>
                  </div>
                )}
              </div>

              {/* Assignee */}
              {assignee && (
                <Avatar className="w-7 h-7 border-2 border-gray-700 group-hover:border-gray-600 transition-all hover:scale-110 shadow-md">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                    {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
