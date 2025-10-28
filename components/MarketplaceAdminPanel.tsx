import React, { useState } from 'react';
import { Selectable } from 'kysely';
import { Edit, Trash2, Package } from 'lucide-react';
import { MarketplaceItems } from '../helpers/schema';
import { useLanguage } from '../helpers/useLanguage';
import { useMarketplaceItems, useDeleteMarketplaceItem, useMarketplaceOrders, useUpdateOrderStatus } from '../helpers/useMarketplaceQueries';
import { MarketplaceItemDialog } from './MarketplaceItemDialog';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { MarketplaceOrderStatus, MarketplaceOrderStatusArrayValues } from '../helpers/schema';
import styles from './MarketplaceAdminPanel.module.css';

export const MarketplaceAdminPanel = () => {
  const { t } = useLanguage();
  const { data: items, isFetching: isFetchingItems, error: itemsError } = useMarketplaceItems();
  const { data: orders, isFetching: isFetchingOrders, error: ordersError } = useMarketplaceOrders();
  const deleteItemMutation = useDeleteMarketplaceItem();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Selectable<MarketplaceItems> | null>(null);

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsItemDialogOpen(true);
  };

  const handleEdit = (item: Selectable<MarketplaceItems>) => {
    setSelectedItem(item);
    setIsItemDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate({ id });
    }
  };

  const handleStatusChange = (orderId: number, status: MarketplaceOrderStatus) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const renderItemsTable = () => {
    if (isFetchingItems) return <Skeleton style={{ height: '200px' }} />;
    if (itemsError) return <div className={styles.errorState}>{itemsError.message}</div>;
    if (!items || items.length === 0) return <div className={styles.emptyState}>No items found.</div>;

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('marketplaceAdmin.image')}</th>
              <th>{t('marketplaceAdmin.name')}</th>
              <th>{t('marketplaceAdmin.category')}</th>
              <th>{t('marketplaceAdmin.price')}</th>
              <th>{t('marketplaceAdmin.stock')}</th>
              <th>{t('marketplaceAdmin.unit')}</th>
              <th>{t('marketplaceAdmin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <div className={styles.imageCell}>
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <Package />}
                  </div>
                </td>
                <td>{item.name}</td>
                <td>{item.category || '-'}</td>
                <td>₹{item.price}</td>
                <td>{item.stockQuantity}</td>
                <td>{item.unit}</td>
                <td>
                  <div className={styles.actionsCell}>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item)}><Edit size={14} /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderOrdersTable = () => {
    if (isFetchingOrders) return <Skeleton style={{ height: '200px' }} />;
    if (ordersError) return <div className={styles.errorState}>{ordersError.message}</div>;
    if (!orders || orders.length === 0) return <div className={styles.emptyState}>No orders found.</div>;

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('marketplaceAdmin.orderId')}</th>
              <th>{t('marketplaceAdmin.user')}</th>
              <th>{t('marketplaceAdmin.items')}</th>
              <th>{t('marketplaceAdmin.total')}</th>
              <th>{t('marketplaceAdmin.delivery')}</th>
              <th>{t('marketplaceAdmin.date')}</th>
              <th>{t('marketplaceAdmin.status')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user.businessName}</td>
                <td>{order.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}</td>
                <td>₹{order.totalAmount}</td>
                <td>{order.deliveryAddress}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value as MarketplaceOrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MarketplaceOrderStatusArrayValues.map(status => (
                        <SelectItem key={status} value={status}>
                          {t(`marketplaceAdmin.${status}` as any)}
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
    );
  };

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{t('marketplaceAdmin.itemsManagement')}</h2>
          <Button onClick={handleAddNew}>{t('marketplaceAdmin.addNewItem')}</Button>
        </div>
        {renderItemsTable()}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{t('marketplaceAdmin.ordersManagement')}</h2>
        </div>
        {renderOrdersTable()}
      </section>

      <MarketplaceItemDialog
        isOpen={isItemDialogOpen}
        onClose={() => setIsItemDialogOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};