function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Please log in first" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action" });
    }

    if (req.user.role === "seller" && !req.user.sellerApproved) {
      return res.status(403).json({ message: "Your seller account is awaiting approval" });
    }

    next();
  };
}

module.exports = requireRole;