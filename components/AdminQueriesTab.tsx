import React, { useState } from 'react';
import { useAdminQueries, useUpdateQueryStatus } from '../helpers/useAdminQueries';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { QueryStatus, QueryStatusArrayValues } from '../helpers/schema';
import { Phone, Calendar, MessageSquare, Hash } from 'lucide-react';
import styles from './AdminQueriesTab.module.css';
import { formatDate, getRelativeTimeString } from '../helpers/dateUtils';

const STATUS_BADGE_VARIANT_MAP: Record<QueryStatus, 'success' | 'warning' | 'default'> = {
  resolved: 'success',
  in_progress: 'warning',
  new: 'default',
};

const STATUS_LABEL_MAP: Record<QueryStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export const AdminQueriesTab = () => {
  const [statusFilter, setStatusFilter] = useState<QueryStatus | 'all'>('all');
  const { data: queries, isFetching, error } = useAdminQueries({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const { mutate: updateStatus } = useUpdateQueryStatus();

  const handleStatusChange = (id: number, status: QueryStatus) => {
    updateStatus({ id, status });
  };

  const renderContent = () => {
    if (isFetching && !queries) {
      return (
        <div className={styles.skeletonContainer}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} style={{ height: '3rem' }} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <p>Error loading queries</p>
          <p><em>{error.message}</em></p>
        </div>
      );
    }

    if (!queries || queries.length === 0) {
      return <div className={styles.emptyState}>No queries found</div>;
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Contact</th>
                <th>Message</th>
                <th>Submitted On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query) => (
                <tr key={query.id}>
                  <td data-label="ID">{query.id}</td>
                  <td data-label="User">{query.name || 'Guest'}</td>
                  <td data-label="Contact">{query.contactNumber}</td>
                  <td data-label="Message" className={styles.messageCell}>{query.message}</td>
                  <td data-label="Submitted On">{new Date(query.createdAt).toLocaleString()}</td>
                  <td data-label="Status">
                    <Select value={query.status} onValueChange={(newStatus) => handleStatusChange(query.id, newStatus as QueryStatus)}>
                      <SelectTrigger className={styles.statusSelectTrigger}>
                        <SelectValue>
                          <Badge variant={STATUS_BADGE_VARIANT_MAP[query.status]}>
                            {STATUS_LABEL_MAP[query.status]}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {QueryStatusArrayValues.map(status => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABEL_MAP[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className={styles.cardsContainer}>
          {queries.map((query) => (
            <div key={query.id} className={styles.queryCard}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderContent}>
                  <div className={styles.queryIdBadge}>
                    <Hash size={14} />
                    <span>{query.id}</span>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT_MAP[query.status]}>
                    {STATUS_LABEL_MAP[query.status]}
                  </Badge>
                </div>
                <h3 className={styles.userName}>{query.name || 'Guest'}</h3>
                <div className={styles.contactInfo}>
                  <Phone size={14} />
                  <span>{query.contactNumber}</span>
                </div>
              </div>

              {/* Message Section */}
              <div className={styles.cardSection}>
                <div className={styles.sectionTitle}>Message</div>
                <div className={styles.messageBox}>
                  <MessageSquare size={16} className={styles.messageIcon} />
                  <p className={styles.messageText}>{query.message}</p>
                </div>
              </div>

              {/* Date Section */}
              <div className={styles.cardSection}>
                <div className={styles.sectionTitle}>Submitted</div>
                <div className={styles.dateInfo}>
                  <Calendar size={14} />
                  <span>
                    {formatDate(query.createdAt)}
                    <span className={styles.relativeTime}> • {getRelativeTimeString(query.createdAt)}</span>
                  </span>
                </div>
              </div>

              {/* Status Section */}
              <div className={styles.cardSection}>
                <div className={styles.sectionTitle}>Update Status</div>
                <Select 
                  value={query.status} 
                  onValueChange={(newStatus) => handleStatusChange(query.id, newStatus as QueryStatus)}
                >
                  <SelectTrigger className={styles.statusSelector}>
                    <SelectValue>
                      <Badge variant={STATUS_BADGE_VARIANT_MAP[query.status]} className={styles.statusBadge}>
                        {STATUS_LABEL_MAP[query.status]}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {QueryStatusArrayValues.map(status => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABEL_MAP[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QueryStatus | 'all')}>
          <SelectTrigger className={styles.statusFilter}>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {QueryStatusArrayValues.map(status => (
              <SelectItem key={status} value={status}>
                {STATUS_LABEL_MAP[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {renderContent()}
    </div>
  );
};