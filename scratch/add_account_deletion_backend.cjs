const fs = require('fs');

const controllerPath = 'C:\\Users\\aksin\\OneDrive\\Desktop\\football_backend\\src\\controllers\\authController.js';
const routesPath = 'C:\\Users\\aksin\\OneDrive\\Desktop\\football_backend\\src\\routes\\authRoutes.js';

let controllerContent = fs.readFileSync(controllerPath, 'utf8');

if (!controllerContent.includes('deleteUserAccount')) {
  const deleteFunction = `
export const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const deleted = await Registration.destroy({ where: { id: userId } });
    return res.json({
      success: true,
      message: 'Account deleted successfully from server',
      deletedCount: deleted,
    });
  } catch (error) {
    next(error);
  }
};
`;
  controllerContent += deleteFunction;
  fs.writeFileSync(controllerPath, controllerContent, 'utf8');
  console.log('Added deleteUserAccount to authController.js');
} else {
  console.log('deleteUserAccount already exists in authController.js');
}

let routesContent = fs.readFileSync(routesPath, 'utf8');
if (!routesContent.includes('/account')) {
  // Update import to include deleteUserAccount
  routesContent = routesContent.replace(
    "import { userLogin, generateLoginToken, verifyLoginToken } from '../controllers/authController.js';",
    "import { userLogin, generateLoginToken, verifyLoginToken, deleteUserAccount } from '../controllers/authController.js';"
  );
  // Add route before export default router
  routesContent = routesContent.replace(
    "export default router;",
    "// DELETE /api/auth/account (Protected)\nrouter.delete('/account', verifyUserToken, deleteUserAccount);\n\nexport default router;"
  );
  fs.writeFileSync(routesPath, routesContent, 'utf8');
  console.log('Added DELETE /account to authRoutes.js');
} else {
  console.log('/account route already exists in authRoutes.js');
}
