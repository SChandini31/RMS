const allowRoles = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const userRoles = Array.isArray(req.user.role)
      ? req.user.role
      : [req.user.role];

    const hasPermission = roles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};

module.exports = allowRoles;