import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TASK_PRIORITIES, PRIORITY_LABELS } from '../../models/task.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css'
})
export class FilterBarComponent {
  filtersChanged = output<{ priority: string; dueDateFrom: string; dueDateTo: string }>();

  readonly priorities = TASK_PRIORITIES;
  readonly priorityLabels = PRIORITY_LABELS;

  priority = '';
  dueDateFrom = '';
  dueDateTo = '';

  onFilterChange() {
    this.filtersChanged.emit({
      priority: this.priority,
      dueDateFrom: this.dueDateFrom,
      dueDateTo: this.dueDateTo
    });
  }

  clearFilters() {
    this.priority = '';
    this.dueDateFrom = '';
    this.dueDateTo = '';
    this.onFilterChange();
  }
}
