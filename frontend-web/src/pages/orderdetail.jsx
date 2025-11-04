import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatCurrency, formatDateTime, getOrderStatusLabel } from '../utils/helpers';
import Loading from '../components/common/Loading';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const response = await orderAPI.getOrderById(id);
      if (response.success) {
        setOrder(response.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderAPI.cancelOrder(id, 'Customer cancelled');
        fetchOrderDetail();
      } catch (error) {
        console.error('Cancel order error:', error);
      }
    }
  };

  if (loading) return <Loading message="Loading order details..." />;

  if (!order) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Order not found</h2>
          <button onClick={() => navigate('/orders')} className="btn btn-primary">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="container">
        <button onClick={() => navigate('/orders')} className="back-btn">
          ← Back to Orders
        </button>

        <div className="order-detail-card">
          <div className="order-header">
            <div>
              <h1>Order #{order.orderNumber}</h1>
              <p className="order-date">{formatDateTime(order.createdAt)}</p>
            </div>
            <span className={`order-status status-${order.status}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          {/* Order Items */}
          <div className="section">
            <h2>Order Items</h2>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Addresses */}
          <div className="section">
            <h2>Delivery Information</h2>
            <div className="address-grid">
              <div className="address-card">
                <h3>📍 Pickup Address</h3>
                <p>{order.pickupAddress.addressLine1}</p>
                <p>{order.pickupAddress.city}, {order.pickupAddress.pincode}</p>
              </div>
              <div className="address-card">
                <h3>📍 Delivery Address</h3>
                <p>{order.deliveryAddress.addressLine1}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.pincode}</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="section">
            <h2>Payment Summary</h2>
            <div className="pricing-details">
              <div className="pricing-row">
                <span>Subtotal</span>
                <span>{formatCurrency(order.pricing.subtotal)}</span>
              </div>
              <div className="pricing-row">
                <span>Delivery Fee</span>
                <span>{formatCurrency(order.pricing.deliveryFee)}</span>
              </div>
              <div className="pricing-row">
                <span>Tax</span>
                <span>{formatCurrency(order.pricing.tax)}</span>
              </div>
              <div className="pricing-row total">
                <span>Total</span>
                <span>{formatCurrency(order.pricing.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {order.status === 'pending' && (
            <div className="order-actions">
              <button onClick={handleCancelOrder} className="btn btn-danger">
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;