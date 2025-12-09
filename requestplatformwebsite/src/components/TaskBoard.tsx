"use client";
import React from "react";
import styles from "@/styles/TaskBoard.module.css";
import { TaskItem, Subteam, Priority } from "@/lib/types";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import BatchOperationsBar from "./BatchOperationsBar";
import TaskCard from "./TaskCard";

export default function TaskBoard({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onBatchUpdate,
  onUpdate,
  onClaim,
  currentUserName,
}: {
  tasks: TaskItem[];
  onToggle: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onBatchUpdate: (
    ids: string[],
    update: { completed?: boolean; subteam?: Subteam; priority?: Priority }
  ) => Promise<void>;
  onUpdate: (task: TaskItem) => Promise<void>;
  onClaim?: (id: string) => void;
  currentUserName?: string;
}) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  React.useEffect(() => {
    const validIds = tasks.map((t) => t.id);
    setSelectedIds((prev) => prev.filter((id) => validIds.includes(id)));
  }, [tasks]);
  const uncompleted = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed && !t.archived);
  const unassigned = uncompleted.filter((t) => !t.assignee);
  const assigned = uncompleted.filter((t) => t.assignee);

  // Disable drag-and-drop when tasks are selected
  function shouldDisableDrag(id: string) {
    return selectedIds.length > 0;
  }

  function handleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }

  async function handleBatchUpdate(update: {
    completed?: boolean;
    subteam?: Subteam;
    priority?: Priority;
  }) {
    await onBatchUpdate(selectedIds, update);
    setSelectedIds([]);
  }

  function handleClearSelection() {
    setSelectedIds([]);
  }

  function isSelected(id: string) {
    return selectedIds.includes(id);
  }

  // Drag and drop handler
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

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    // Column movement logic:
    switch (destination.droppableId) {
      case "unassigned":
        // Mark uncompleted + remove assignee
        onUpdate({ ...task, completed: false, assignee: "" });
        break;

      case "assigned":
        // Move to assigned (user can edit assignment later)
        onUpdate({ ...task, completed: false });
        break;

      case "completed":
        if (!task.completed) onToggle(task.id); // toggles to completed
        break;

      default:
        break;
    }
  };

  // Render task card helper
  const renderTaskCard = (task: TaskItem) => (
    <TaskCard
      task={task}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      onArchive={onArchive}
      onClaim={onClaim}
      currentUserName={currentUserName}
      selected={isSelected(task.id)}
      onSelect={handleSelect}
    />
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        {selectedIds.length > 0 && (
          <BatchOperationsBar
            selectedCount={selectedIds.length}
            onBatchUpdate={handleBatchUpdate}
            onClearSelection={handleClearSelection}
          />
        )}
        <div className={styles.grid}>
          {/* Uncompleted Unassigned */}
          <Droppable droppableId="unassigned">
            {(provided: any) => (
              <div
                className={styles.column}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3>Uncompleted — Unassigned</h3>
                <div className={styles.colBody}>
                  {unassigned.length === 0 && (
                    <div className={styles.empty}>No unassigned tasks.</div>
                  )}
                  {unassigned.map((t, i) =>
                    shouldDisableDrag(t.id) ? (
                      <div key={t.id}>
                        {renderTaskCard(t)}
                      </div>
                    ) : (
                      <Draggable key={t.id} draggableId={t.id} index={i}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {renderTaskCard(t)}
                          </div>
                        )}
                      </Draggable>
                    )
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          {/* Uncompleted Assigned */}
          <Droppable droppableId="assigned">
            {(provided: any) => (
              <div
                className={styles.column}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3>Uncompleted — Assigned</h3>
                <div className={styles.colBody}>
                  {assigned.length === 0 && (
                    <div className={styles.empty}>No assigned tasks.</div>
                  )}
                  {assigned.map((t, i) =>
                    shouldDisableDrag(t.id) ? (
                      <div key={t.id}>
                        {renderTaskCard(t)}
                      </div>
                    ) : (
                      <Draggable key={t.id} draggableId={t.id} index={i}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {renderTaskCard(t)}
                          </div>
                        )}
                      </Draggable>
                    )
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          {/* Completed */}
          <Droppable droppableId="completed">
            {(provided: any) => (
              <div
                className={styles.column}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3>Completed Tasks</h3>
                <div className={styles.colBody}>
                  {completed.length === 0 && (
                    <div className={styles.empty}>Nothing completed yet.</div>
                  )}
                  {completed.map((t, i) =>
                    shouldDisableDrag(t.id) ? (
                      <div key={t.id}>
                        {renderTaskCard(t)}
                      </div>
                    ) : (
                      <Draggable key={t.id} draggableId={t.id} index={i}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {renderTaskCard(t)}
                          </div>
                        )}
                      </Draggable>
                    )
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
}
