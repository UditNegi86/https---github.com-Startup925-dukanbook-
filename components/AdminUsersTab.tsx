import React, { useState, useMemo } from "react";
import { useLanguage } from "../helpers/useLanguage";
import { useAdminUsers, useToggleUserStatus, useApproveSubscription } from "../helpers/useAdminQueries";
import { Skeleton } from "./Skeleton";
import { Input } from "./Input";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { ResetPinDialog } from "./ResetPinDialog";
import { Search, KeyRound, UserX, UserCheck, CheckCircle, Phone, Calendar, TrendingUp, FileText } from "lucide-react";
import styles from "./AdminUsersTab.module.css";
import { AdminUser } from "../endpoints/admin/users_GET.schema";
import { getRelativeTimeString, formatDate, formatCurrency } from "../helpers/dateUtils";

type SubscriptionStatus = "trial" | "pending" | "active" | "expired" | null;

const SubscriptionInfo = ({ user }: { user: AdminUser }) => {
  const status = (user.subscriptionStatus?.toLowerCase() ?? 'trial') as SubscriptionStatus;
  
  let badgeVariant: "default" | "secondary" | "destructive" | "success" | "warning" = "secondary";
  let statusText = "Trial";

  switch (status) {
    case 'active':
      badgeVariant = 'success';
      statusText = 'Active';
      break;
    case 'pending':
      badgeVariant = 'warning';
      statusText = 'Pending';
      break;
    case 'expired':
      badgeVariant = 'destructive';
      statusText = 'Expired';
      break;
    case 'trial':
    default:
      badgeVariant = 'secondary';
      statusText = 'Trial';
      break;
  }

  return (
    <div className={styles.subscriptionCell}>
      <Badge variant={badgeVariant}>{statusText}</Badge>
      {user.subscriptionPlanMonths && (
        <span className={styles.subscriptionDetails}>{user.subscriptionPlanMonths} months</span>
      )}
      {user.subscriptionEndDate && (
        <span className={styles.subscriptionDetails}>
          Expires: {formatDate(user.subscriptionEndDate)}
        </span>
      )}
    </div>
  );
};

export const AdminUsersTab = () => {
  const { t } = useLanguage();
  const { data: users, isFetching, error } = useAdminUsers();
  const { mutate: toggleStatus, isPending: isTogglingStatus } = useToggleUserStatus();
  const { mutate: approveSubscription, isPending: isApproving } = useApproveSubscription();

  const [searchQuery, setSearchQuery] = useState("");
  const [resetPinDialogOpen, setResetPinDialogOpen] = useState(false);
  const [confirmDisableUser, setConfirmDisableUser] = useState<AdminUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase().trim();
    return users.filter(
      (user) =>
        user.businessName.toLowerCase().includes(query) ||
        user.ownerName.toLowerCase().includes(query) ||
        user.contactNumber.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleToggleStatus = (user: AdminUser) => {
    if (user.isActive) {
      setConfirmDisableUser(user);
    } else {
      toggleStatus({ userId: user.id });
    }
  };

  const renderContent = () => {
    if (isFetching && !users) {
      return (
        <div className={styles.skeletonContainer}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} style={{ height: "3rem" }} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <p>{t("admin.errorLoadingUsers")}</p>
          <p><em>{error.message}</em></p>
        </div>
      );
    }

    if (!filteredUsers || filteredUsers.length === 0) {
        return <div className={styles.emptyState}>{t("admin.noUsersFound")}</div>;
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("admin.users.businessName")}</th>
                <th>{t("admin.users.ownerName")}</th>
                <th>{t("admin.users.contact")}</th>
                <th>{t("admin.users.status")}</th>
                <th>Subscription</th>
                <th>{t("admin.users.estimateCount")}</th>
                <th>{t("admin.users.totalAmount")}</th>
                <th>{t("admin.users.joinedOn")}</th>
                <th>{t("admin.users.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td data-label={t("admin.users.businessName")}>{user.businessName}</td>
                  <td data-label={t("admin.users.ownerName")}>{user.ownerName}</td>
                  <td data-label={t("admin.users.contact")}>{user.contactNumber}</td>
                  <td data-label={t("admin.users.status")}>
                    {user.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Disabled</Badge>
                    )}
                  </td>
                  <td data-label="Subscription"><SubscriptionInfo user={user} /></td>
                  <td data-label={t("admin.users.estimateCount")}>{user.estimateCount}</td>
                  <td data-label={t("admin.users.totalAmount")}>{formatCurrency(user.totalAmount)}</td>
                  <td data-label={t("admin.users.joinedOn")}>{formatDate(user.createdAt)}</td>
                  <td data-label={t("admin.users.actions")} className={styles.actionsCell}>
                    {user.subscriptionStatus === 'pending' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="primary"
                            size="icon-sm"
                            onClick={() => approveSubscription({ userId: user.id })}
                            disabled={isApproving}
                          >
                            <CheckCircle size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Approve Subscription</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setSelectedUser({
                              id: user.id,
                              name: user.businessName,
                            });
                            setResetPinDialogOpen(true);
                          }}
                        >
                          <KeyRound size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("admin.users.resetPin")}</TooltipContent>
                    </Tooltip>
                    {user.role !== 'admin' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={user.isActive ? "destructive" : "primary"}
                            size="icon-sm"
                            onClick={() => handleToggleStatus(user)}
                            disabled={isTogglingStatus && confirmDisableUser?.id === user.id}
                          >
                            {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{user.isActive ? "Disable User" : "Enable User"}</TooltipContent>
                      </Tooltip>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className={styles.cardsContainer}>
          {filteredUsers.map((user) => {
            const status = (user.subscriptionStatus?.toLowerCase() ?? 'trial') as SubscriptionStatus;
            let subscriptionBadgeVariant: "default" | "secondary" | "destructive" | "success" | "warning" = "secondary";
            let subscriptionStatusText = "Trial";

            switch (status) {
              case 'active':
                subscriptionBadgeVariant = 'success';
                subscriptionStatusText = 'Active';
                break;
              case 'pending':
                subscriptionBadgeVariant = 'warning';
                subscriptionStatusText = 'Pending';
                break;
              case 'expired':
                subscriptionBadgeVariant = 'destructive';
                subscriptionStatusText = 'Expired';
                break;
              case 'trial':
              default:
                subscriptionBadgeVariant = 'secondary';
                subscriptionStatusText = 'Trial';
                break;
            }

            return (
              <div key={user.id} className={styles.userCard}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderContent}>
                    <h3 className={styles.businessName}>{user.businessName}</h3>
                    <div className={styles.statusBadges}>
                      {user.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Disabled</Badge>
                      )}
                    </div>
                  </div>
                  <div className={styles.ownerName}>{user.ownerName}</div>
                  <div className={styles.contactInfo}>
                    <Phone size={14} />
                    <span>{user.contactNumber}</span>
                  </div>
                </div>

                {/* Subscription Section */}
                <div className={styles.cardSection}>
                  <div className={styles.sectionTitle}>Subscription</div>
                  <div className={styles.subscriptionInfo}>
                    <Badge variant={subscriptionBadgeVariant} className={styles.subscriptionBadge}>
                      {subscriptionStatusText}
                    </Badge>
                    <div className={styles.subscriptionMeta}>
                      {user.subscriptionPlanMonths && (
                        <span className={styles.subscriptionDetail}>
                          {user.subscriptionPlanMonths} month plan
                        </span>
                      )}
                      {user.subscriptionEndDate && (
                        <span className={styles.subscriptionDetail}>
                          Expires: {formatDate(user.subscriptionEndDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className={styles.cardSection}>
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <FileText size={16} className={styles.statIcon} />
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>{user.estimateCount}</div>
                        <div className={styles.statLabel}>Estimates</div>
                      </div>
                    </div>
                    <div className={styles.statItem}>
                      <TrendingUp size={16} className={styles.statIcon} />
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>{formatCurrency(user.totalAmount)}</div>
                        <div className={styles.statLabel}>Total Amount</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Joined Date Section */}
                <div className={styles.cardSection}>
                  <div className={styles.joinedDate}>
                    <Calendar size={14} />
                    <span>
                      Joined {formatDate(user.createdAt)} 
                      <span className={styles.relativeTime}> • {getRelativeTimeString(user.createdAt)}</span>
                    </span>
                  </div>
                </div>

                {/* Actions Section */}
                <div className={styles.cardActions}>
                  {user.subscriptionStatus === 'pending' && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => approveSubscription({ userId: user.id })}
                      disabled={isApproving}
                      className={styles.actionButton}
                    >
                      <CheckCircle size={16} />
                      {isApproving ? "Approving..." : "Approve Subscription"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setSelectedUser({
                        id: user.id,
                        name: user.businessName,
                      });
                      setResetPinDialogOpen(true);
                    }}
                    className={styles.actionButton}
                  >
                    <KeyRound size={16} />
                    {t("admin.users.resetPin")}
                  </Button>
                  {user.role !== 'admin' && (
                    <Button
                      variant={user.isActive ? "destructive" : "primary"}
                      size="md"
                      onClick={() => handleToggleStatus(user)}
                      disabled={isTogglingStatus && confirmDisableUser?.id === user.id}
                      className={styles.actionButton}
                    >
                      {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      {user.isActive ? "Disable User" : "Enable User"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <Input
            type="text"
            placeholder={t("admin.users.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>
      {renderContent()}
      {selectedUser && (
        <ResetPinDialog
          userId={selectedUser.id}
          userName={selectedUser.name}
          open={resetPinDialogOpen}
          onOpenChange={setResetPinDialogOpen}
        />
      )}
      {confirmDisableUser && (
        <Dialog open onOpenChange={() => setConfirmDisableUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disable User</DialogTitle>
              <DialogDescription>
                Are you sure you want to disable the user "{confirmDisableUser.businessName}"? They will not be able to log in.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setConfirmDisableUser(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toggleStatus({ userId: confirmDisableUser.id });
                  setConfirmDisableUser(null);
                }}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus ? "Disabling..." : "Confirm Disable"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};