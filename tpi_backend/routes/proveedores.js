const express = require("express");
const router = express.Router();
const auth = require("../seguridad/auth");
const db = require("../base-orm/sequelize-init");
const { Op } = require("sequelize");

// GET para todos los proveedores con autenticación JWT
router.get("/api/proveedoresJWT", auth.authenticateJWT, async function (req, res, next) {
  try {
    const { rol } = res.locals.user;
    if (rol !== "member" && rol !== "admin") {
      return res.status(403).json({ message: "Usuario no autorizado!" });
    }

    const { nombre } = req.query;
    let whereCondition = {};

    if (nombre) {
      whereCondition = {
        nombre_empresa: {
          [Op.like]: `%${nombre}%`,
        },
      };
    }

    let data = await db.Proveedores.findAll({
      where: whereCondition,
      attributes: ["id_proveedor", "nombre_empresa", "nombre_proveedor", "telefono", "fecha_registro"],
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET para los proveedores filtrados por id con autenticación JWT
router.get("/api/proveedoresJWT/:id", auth.authenticateJWT, async function (req, res) {
  try {
    const { rol } = res.locals.user;
    if (rol !== "admin") {
      return res.status(403).json({ message: "Usuario no autorizado!" });
    }

    const proveedor = await db.Proveedores.findByPk(req.params.id);
    if (proveedor) {
      res.json(proveedor);
    } else {
      res.status(404).json({ message: "Proveedor no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en la consulta", error });
  }
});

// POST para crear un nuevo proveedor con autenticación JWT
router.post("/api/proveedoresJWT", auth.authenticateJWT, async (req, res) => {
  const { rol } = res.locals.user;
  if (rol !== "admin") {
    return res.status(403).json({ message: "Usuario no autorizado!" });
  }

  const { nombre_empresa, nombre_proveedor, telefono, fecha_registro } = req.body;

  try {
    const proveedorExistente = await db.Proveedores.findOne({
      where: { nombre_proveedor },
    });

    if (proveedorExistente) {
      return res.status(400).json({ message: "Ya existe un proveedor con ese nombre" });
    }

    let nuevoProveedor = {
      nombre_empresa,
      nombre_proveedor,
      telefono,
      fecha_registro,
    };

    const proveedorCreado = await db.Proveedores.create(nuevoProveedor);
    res.status(201).json(proveedorCreado);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el proveedor", error });
  }
});

// PUT para modificar un proveedor con autenticación JWT
router.put("/api/proveedoresJWT/:id", auth.authenticateJWT, async (req, res) => {
  const { rol } = res.locals.user;
  if (rol !== "admin") {
    return res.status(403).json({ message: "Usuario no autorizado!" });
  }

  const { id } = req.params;
  const { nombre_empresa, nombre_proveedor, telefono, fecha_registro } = req.body;

  try {
    const proveedorExistente = await db.Proveedores.findOne({
      where: {
        nombre_proveedor,
        id_proveedor: { [Op.ne]: id },
      },
    });

    if (proveedorExistente) {
      return res.status(400).json({ message: "Ya existe un proveedor con ese nombre" });
    }

    const proveedor = await db.Proveedores.findByPk(id);
    if (proveedor) {
      proveedor.nombre_empresa = nombre_empresa;
      proveedor.nombre_proveedor = nombre_proveedor;
      proveedor.telefono = telefono;
      proveedor.fecha_registro = fecha_registro;

      await proveedor.save();
      res.json({ message: "Proveedor actualizado", proveedor });
    } else {
      res.status(404).json({ message: "Proveedor no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el proveedor", error });
  }
});

// DELETE para eliminar un proveedor con autenticación JWT
router.delete("/api/proveedoresJWT/:id", auth.authenticateJWT, async (req, res) => {
  const { rol } = res.locals.user;
  if (rol !== "admin") {
    return res.status(403).json({ message: "Usuario no autorizado!" });
  }

  const { id } = req.params;

  try {
    const proveedor = await db.Proveedores.findByPk(id);

    if (proveedor) {
      await proveedor.destroy();
      res.json({ message: "Proveedor eliminado" });
    } else {
      res.status(404).json({ message: "Proveedor no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el proveedor", error });
  }
});

module.exports = router;
