import userRoutes from '../routes/user.route.js';
import complainRoutes from '../routes/complains.route.js'
import adminRoutes from '../routes/admin.route.js'

export default (app) => {
    app.use('/api/v1/auth', userRoutes);
    app.use('/api/v1/complain', complainRoutes);
    app.use('/api/v1/admin', adminRoutes);
}