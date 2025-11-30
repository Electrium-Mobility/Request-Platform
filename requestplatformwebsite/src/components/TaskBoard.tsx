'use client';
import styles from '@/styles/TaskBoard.module.css';
import { TaskItem } from '@/lib/types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

export default function TaskBoard({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
}: {
  tasks: TaskItem[];
  onToggle: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
}) {
  const uncompleted = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed && !t.archived);
  const unassigned = uncompleted.filter(t => !t.assignee);
  const assigned = uncompleted.filter(t => t.assignee);

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // If position didn't change, ignore
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Column movement logic:
    switch (destination.droppableId) {
      case "unassigned":
        // Mark uncompleted + remove assignee
        onEdit({ ...task, completed: false, assignee: "" });
        break;

      case "assigned":
        // Move to assigned (user can edit assignment later)
        onEdit({ ...task, completed: false });
        break;

      case "completed":
        if (!task.completed) onToggle(task.id); // toggles to completed
        break;

      default:
        break;
    }
  };

  return (
  <DragDropContext onDragEnd={handleDragEnd}>
    <div className={styles.grid}>

      {/* Uncompleted Unassigned */}
      <Droppable droppableId="unassigned">
        {(provided) => (
          <div className={styles.column} ref={provided.innerRef} {...provided.droppableProps}>
            <h3>Uncompleted — Unassigned</h3>
            <div className={styles.colBody}>
              {unassigned.length === 0 && (
                <div className={styles.empty}>No unassigned tasks.</div>
              )}

              {unassigned.map((t, i) => (
                <Draggable key={t.id} draggableId={t.id} index={i}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <TaskCard
                        task={t}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onArchive={onArchive}
                      />
                    </div>
                  )}
              </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>

      {/* Uncompleted Assigned */}
      <Droppable droppableId="assigned">
        {(provided) => (
          <div className={styles.column} ref={provided.innerRef} {...provided.droppableProps}>
            <h3>Uncompleted — Assigned</h3>
            <div className={styles.colBody}>
              {assigned.length === 0 && (
                <div className={styles.empty}>No assigned tasks.</div>
              )}

              {assigned.map((t, i) => (
                <Draggable key={t.id} draggableId={t.id} index={i}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <TaskCard
                        task={t}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onArchive={onArchive}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>

      {/* Completed */}
      <Droppable droppableId="completed">
        {(provided) => (
          <div className={styles.column} ref={provided.innerRef} {...provided.droppableProps}>
            <h3>Completed Tasks</h3>
            <div className={styles.colBody}>
              {completed.length === 0 && (
                <div className={styles.empty}>Nothing completed yet.</div>
              )}
              {completed.map((t, i) => (
                <TaskCard
                  key={t.id || `completed-${i}`}
                  task={t}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onArchive={onArchive}
                />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  </DragDropContext>
  );
}
