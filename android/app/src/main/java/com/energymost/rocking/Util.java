package com.energymost.rocking;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap.CompressFormat;
import android.util.Log;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.content.ContentUris;
import android.content.ContentValues;
import android.os.Environment;
import android.net.Uri;
import android.database.Cursor;
import android.content.Context;
import android.annotation.TargetApi;
import java.io.File;

import java.io.ByteArrayOutputStream;
import java.lang.Math;


public class Util {
  public static byte[] bmpToByteArray(final Bitmap bmp, final boolean needRecycle) {
    // Log.w("sendWechat","bmpToByteArray begin");
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		bmp.compress(CompressFormat.PNG, 100, output);
		if (needRecycle) {
			bmp.recycle();
		}

		byte[] result = output.toByteArray();
		try {
			output.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
    // Log.w("sendWechat","bmpToByteArray end:"+result.length);
		return result;
	}

  public static byte[] bmpToJPGByteArray(final Bitmap bmp, final boolean needRecycle) {

		ByteArrayOutputStream output = new ByteArrayOutputStream();
		bmp.compress(CompressFormat.JPEG, 50, output);
		if (needRecycle) {
			bmp.recycle();
		}

		byte[] result = output.toByteArray();
		try {
			output.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return result;
	}

  public static byte[] compressImage(String filePath){
    BitmapFactory.Options options = new BitmapFactory.Options();
    options.inJustDecodeBounds = true;//不加载bitmap到内存中
    BitmapFactory.decodeFile(filePath,options);
    int outWidth = options.outWidth;
    int outHeight = options.outHeight;
    // Log.d("image size", "width:" + outWidth + ",height:"+outHeight);

    if(outHeight>outWidth){
      int temp = outHeight;
      outHeight = outWidth;
      outWidth = temp;
    }

    int width = 1280;
    int height = 960;
    options.inDither = false;
    options.inPreferredConfig = Bitmap.Config.ARGB_8888;
    options.inSampleSize = 1;

    if (outWidth != 0 && outHeight != 0 && width != 0 && height != 0) {
      int sampleSize=(int)(Math.ceil((outWidth/width+outHeight/height)/2));
      // Log.d("image size", "sampleSize = " + sampleSize);
      options.inSampleSize = sampleSize;
    }

    options.inJustDecodeBounds = false;
    return bmpToJPGByteArray(BitmapFactory.decodeFile(filePath, options),true);
  }

  public static Uri getImageContentUri(Context context, File imageFile) {
      String filePath = imageFile.getAbsolutePath();
      Cursor cursor = context.getContentResolver().query(
              MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
              new String[] { MediaStore.Images.Media._ID },
              MediaStore.Images.Media.DATA + "=? ",
              new String[] { filePath }, null);
      if (cursor != null && cursor.moveToFirst()) {
          int id = cursor.getInt(cursor.getColumnIndex(MediaStore.MediaColumns._ID));
          cursor.close();
          return Uri.withAppendedPath(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "" + id);
     } else {
          if (imageFile.exists()) {
              ContentValues values = new ContentValues();
              values.put(MediaStore.Images.Media.DATA, filePath);
              return context.getContentResolver().insert(
                      MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
          } else {
              return null;
          }
      }
  }

  /**
   * 根据Uri获取图片绝对路径，解决Android4.4以上版本Uri转换
   * @param activity
   * @param imageUri
   * @author yaoxing
   * @date 2014-10-12
   */
  @TargetApi(19)
  public static String getImageAbsolutePath(Context context, String fileUriString) {
    Uri imageUri = Uri.parse(fileUriString);
    if (context == null || imageUri == null)
      return null;
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT && DocumentsContract.isDocumentUri(context, imageUri)) {
      if (isExternalStorageDocument(imageUri)) {
        String docId = DocumentsContract.getDocumentId(imageUri);
        String[] split = docId.split(":");
        String type = split[0];
        if ("primary".equalsIgnoreCase(type)) {
          return Environment.getExternalStorageDirectory() + "/" + split[1];
        }
      } else if (isDownloadsDocument(imageUri)) {
        String id = DocumentsContract.getDocumentId(imageUri);
        Uri contentUri = ContentUris.withAppendedId(Uri.parse("content://downloads/public_downloads"), Long.valueOf(id));
        return getDataColumn(context, contentUri, null, null);
      } else if (isMediaDocument(imageUri)) {
        String docId = DocumentsContract.getDocumentId(imageUri);
        String[] split = docId.split(":");
        String type = split[0];
        Uri contentUri = null;
        if ("image".equals(type)) {
          contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        } else if ("video".equals(type)) {
          contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
        } else if ("audio".equals(type)) {
          contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
        }
        String selection = MediaStore.Images.Media._ID + "=?";
        String[] selectionArgs = new String[] { split[1] };
        return getDataColumn(context, contentUri, selection, selectionArgs);
      }
    } // MediaStore (and general)
    else if ("content".equalsIgnoreCase(imageUri.getScheme())) {
      // Return the remote address
      if (isGooglePhotosUri(imageUri))
        return imageUri.getLastPathSegment();
      return getDataColumn(context, imageUri, null, null);
    }
    // File
    else if ("file".equalsIgnoreCase(imageUri.getScheme())) {
      return imageUri.getPath();
    }
    return null;
  }

  public static String getDataColumn(Context context, Uri uri, String selection, String[] selectionArgs) {
    Cursor cursor = null;
    String column = MediaStore.Images.Media.DATA;
    String[] projection = { column };
    try {
      cursor = context.getContentResolver().query(uri, projection, selection, selectionArgs, null);
      if (cursor != null && cursor.moveToFirst()) {
        int index = cursor.getColumnIndexOrThrow(column);
        return cursor.getString(index);
      }
    } finally {
      if (cursor != null)
        cursor.close();
    }
    return null;
  }

  /**
   * @param uri The Uri to check.
   * @return Whether the Uri authority is ExternalStorageProvider.
   */
  public static boolean isExternalStorageDocument(Uri uri) {
    return "com.android.externalstorage.documents".equals(uri.getAuthority());
  }

  /**
   * @param uri The Uri to check.
   * @return Whether the Uri authority is DownloadsProvider.
   */
  public static boolean isDownloadsDocument(Uri uri) {
    return "com.android.providers.downloads.documents".equals(uri.getAuthority());
  }

  /**
   * @param uri The Uri to check.
   * @return Whether the Uri authority is MediaProvider.
   */
  public static boolean isMediaDocument(Uri uri) {
    return "com.android.providers.media.documents".equals(uri.getAuthority());
  }

  /**
   * @param uri The Uri to check.
   * @return Whether the Uri authority is Google Photos.
   */
  public static boolean isGooglePhotosUri(Uri uri) {
    return "com.google.android.apps.photos.content".equals(uri.getAuthority());
  }

}
