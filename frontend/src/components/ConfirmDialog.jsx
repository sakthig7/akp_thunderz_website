import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ open, title = 'Are you sure?', message, onConfirm, onCancel, danger = true }) => (
  <Modal open={open} onClose={onCancel} title={title}>
    <p className="mb-6 text-neutral-300">{message}</p>
    <div className="flex justify-end gap-3">
      <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>Confirm</button>
    </div>
  </Modal>
);

export default ConfirmDialog;
