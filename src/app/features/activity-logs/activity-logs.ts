import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService, ActivityLog } from '../../core/services/audit.service';

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-logs.html'
})
export class ActivityLogs implements OnInit {
  auditService = inject(AuditService);
  
  logs = signal<ActivityLog[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading.set(true);
    this.auditService.getLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // Replace the getChanges method with this improved version
  getChanges(log: ActivityLog): { field: string; oldValue: string; newValue: string }[] {
    const changes: { field: string; oldValue: string; newValue: string }[] = [];

    // 1. If Created, show what was created
    if (log.action === 'Added') {
      if (log.newValues) {
        try {
          const newObj = JSON.parse(log.newValues);
          // Show key fields for created items
          if (newObj.Title) changes.push({ field: 'Title', oldValue: '', newValue: newObj.Title });
          if (newObj.Description) changes.push({ field: 'Description', oldValue: '', newValue: this.truncate(newObj.Description, 50) });
          if (newObj.Status) changes.push({ field: 'Status', oldValue: '', newValue: newObj.Status });
          if (newObj.Priority) changes.push({ field: 'Priority', oldValue: '', newValue: newObj.Priority });
        } catch (e) {
          return [{ field: 'Created', oldValue: '', newValue: 'New item created' }];
        }
      }
      return changes.length > 0 ? changes : [{ field: 'Created', oldValue: '', newValue: 'New item created' }];
    }

    // 2. If Deleted
    if (log.action === 'Deleted') {
      if (log.oldValues) {
        try {
          const oldObj = JSON.parse(log.oldValues);
          if (oldObj.Title) return [{ field: 'Deleted', oldValue: oldObj.Title, newValue: '' }];
        } catch (e) {}
      }
      return [{ field: 'Deleted', oldValue: '', newValue: 'Item deleted' }];
    }

    // 3. If Modified, compare Old vs New
    if (log.oldValues && log.newValues) {
      try {
        const oldObj = JSON.parse(log.oldValues);
        const newObj = JSON.parse(log.newValues);

        // Loop through keys and only show what actually changed
        for (const key in newObj) {
          const oldVal = oldObj[key];
          const newVal = newObj[key];

          // Only add if values are different
          if (oldVal !== newVal) {
            changes.push({
              field: this.formatFieldName(key),
              oldValue: this.formatVal(oldVal),
              newValue: this.formatVal(newVal)
            });
          }
        }
      } catch (e) {
        return [{ field: 'Error', oldValue: '', newValue: 'Error parsing details' }];
      }
    }

    return changes;
  }

  // Helper to make field names readable
  private formatFieldName(field: string): string {
    // Convert PascalCase to Title Case with spaces
    return field.replace(/([A-Z])/g, ' $1').trim();
  }

  // Helper to make values readable
  private formatVal(val: any): string {
    if (val === null || val === undefined || val === '') return 'None';
    
    // ✅ BETTER DATE DETECTION: Check for ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) { // Verify it's a valid date
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    
    return this.truncate(val.toString(), 100);
  }

  // Helper to truncate long text
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getActionColor(action: string) {
    switch (action) {
      case 'Added': return 'text-success bg-success-subtle border-success';
      case 'Deleted': return 'text-danger bg-danger-subtle border-danger';
      case 'Modified': return 'text-primary bg-primary-subtle border-primary';
      default: return 'text-secondary bg-light border-secondary';
    }
  }
}