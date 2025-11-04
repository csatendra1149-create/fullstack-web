import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '../utils/helpers';
import Loading from '../components/common/Loading';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await orderAPI.getUserOrders(params);
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your orders..." />;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track and manage your food orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="order-filters">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button
            className={`filter-tab ${filter === 'out_for_delivery' ? 'active' : ''}`}
            onClick={() => setFilter('out_for_delivery')}
          >
            Out for Delivery
          </button>
          <button
            className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="no-orders">
            <span className="no-orders-icon">📦</span>
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet!</p>
            <Link to="/meals" className="btn btn-primary">
              Browse Meals
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <Link to={`/orders/${order._id}`} key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-number">
                    <span className="label">Order #</span>
                    <span className="value">{order.orderNumber}</span>
                  </div>
                  <span className={`order-status badge-${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-image">
                        {item.meal?.images?.[0]?.url ? (
                          <img src={item.meal.images[0].url} alt={item.name} />
                        ) : (
                          <span className="item-placeholder">🍛</span>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-info">
                  <div className="info-row">
                    <span className="info-label">Kitchen:</span>
                    <span className="info-value">
                      👩‍🍳 {order.homeKitchen?.kitchenDetails?.kitchenName || order.homeKitchen?.name}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ordered:</span>
                    <span className="info-value">{formatDateTime(order.createdAt)}</span>
                  </div>
                  {order.scheduledTime && (
                    <div className="info-row">
                      <span className="info-label">Scheduled:</span>
                      <span className="info-value">
                        {formatDateTime(order.scheduledTime.date)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">{formatCurrency(order.pricing.total)}</span>
                  </div>
                  <button className="view-details-btn">
                    View Details →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;