import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// 'AnyZodObject' yerine 'ZodSchema' kullanıyoruz (Daha kapsayıcı)
export const validate = (schema: ZodSchema<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            // Gelen veriyi (body) şemaya göre kontrol et
            schema.parse(req.body);
            next(); // Sorun yoksa devam et
        } catch (error) {
            if (error instanceof ZodError) {
                // Zod hatasıysa detaylı bilgi ver
                const errorMessages = error.errors.map((err: any) => ({
                    field: err.path[0],
                    message: err.message
                }));
                res.status(400).json({ error: "Validasyon Hatası", details: errorMessages });
                return;
            }
            res.status(500).json({ error: "Sunucu hatası" });
        }
    };