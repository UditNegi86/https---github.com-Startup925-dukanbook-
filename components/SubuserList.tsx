import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, AlertTriangle } from 'lucide-react';
import { useSubusers, useDeleteSubuser } from '../helpers/useSubuserQueries';
import { Subuser } from '../endpoints/subusers_GET.schema';
import { useLanguage } from '../helpers/useLanguage';
import { Button } from './Button';
import { Badge } from './Badge';
import { Skeleton } from './Skeleton';
import { SubuserDialog } from './SubuserDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from './Dialog';
import styles from './SubuserList.module.css';

export const SubuserList = () => {
  const { t } = useLanguage();
  const { data: subusers, isFetching, error } = useSubusers();
  const { mutate: deleteSubuser, isPending: isDeleting } = useDeleteSubuser();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubuser, setSelectedSubuser] = useState<Subuser | null>(null);

  const handleAdd = () => {
    setSelectedSubuser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (subuser: Subuser) => {
    setSelectedSubuser(subuser);
    setIsDialogOpen(true);
  };

  const handleDelete = (subuserId: number) => {
    deleteSubuser({ subuserId });
  };

  const renderContent = () => {
    if (isFetching) {
      return <SubuserListSkeleton />;
    }

    if (error) {
      return (
        <div className={styles.centeredMessage}>
          <AlertTriangle className={styles.errorIcon} />
          <p>{t('subusers.errorLoading')}</p>
          <p className={styles.errorMessage}>{error.message}</p>
        </div>
      );
    }

    if (!subusers || subusers.length === 0) {
      return (
        <div className={styles.centeredMessage}>
          <Users className={styles.emptyIcon} />
          <h2>{t('subusers.noSubusersFound')}</h2>
          <p>{t('subusers.createSubuserToStart')}</p>
        </div>
      );
    }

    return (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('subusers.name')}</th>
            <th>{t('subusers.username')}</th>
            <th>{t('subusers.status')}</th>
            <th>{t('subusers.createdDate')}</th>
            <th className={styles.actionsHeader}>{t('subusers.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {subusers.map((subuser) => (
            <tr key={subuser.id}>
              <td>{subuser.name}</td>
              <td>{subuser.username}</td>
              <td>
                <Badge variant={subuser.isActive ? 'success' : 'outline'}>
                  {subuser.isActive ? t('subusers.active') : t('subusers.inactive')}
                </Badge>
              </td>
              <td>{new Date(subuser.createdAt).toLocaleDateString()}</td>
              <td className={styles.actionsCell}>
                <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(subuser)}>
                  <Edit size={16} />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className={styles.deleteButton}>
                      <Trash2 size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('subusers.deleteTitle')}</DialogTitle>
                      <DialogDescription>
                        {t('subusers.deleteConfirmation', { name: subuser.name })}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">{t('common.cancel')}</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(subuser.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? t('common.deleting') : t('common.delete')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('subusers.title')}</h1>
        <Button onClick={handleAdd}>
          <Plus size={16} />
          {t('subusers.addSubuser')}
        </Button>
      </div>
      <div className={styles.content}>{renderContent()}</div>
      <SubuserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        subuserToEdit={selectedSubuser}
      />
    </div>
  );
};

const SubuserListSkeleton = () => (
  <div className={styles.skeletonContainer}>
    {[...Array(5)].map((_, i) => (
      <div key={i} className={styles.skeletonRow}>
        <Skeleton style={{ width: '20%', height: '1.5rem' }} />
        <Skeleton style={{ width: '20%', height: '1.5rem' }} />
        <Skeleton style={{ width: '15%', height: '1.5rem' }} />
        <Skeleton style={{ width: '15%', height: '1.5rem' }} />
        <Skeleton style={{ width: '10%', height: '1.5rem' }} />
      </div>
    ))}
  </div>
);