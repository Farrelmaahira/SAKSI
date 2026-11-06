package storage

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"saksi-backend/internal/domain"
)

var allowedMime = map[string][]string{
	".pdf":  {"application/pdf"},
	".jpg":  {"image/jpeg"},
	".jpeg": {"image/jpeg"},
	".png":  {"image/png"},
	".webp": {"image/webp"},
}

type LocalStorage struct {
	baseDir string
}

func NewLocalStorage(baseDir string) (*LocalStorage, error) {
	if err := os.MkdirAll(baseDir, 0750); err != nil {
		return nil, fmt.Errorf("storage: create directory: %w", err)
	}
	return &LocalStorage{baseDir: baseDir}, nil
}

func (s *LocalStorage) Save(ctx context.Context, key string, r io.Reader, size int64, declaredMime string) (string, error) {
	if size <= 0 {
		return "", errors.New("file size is required")
	}
	if size > domain.MaxUploadBytes {
		return "", errors.New("file exceeds maximum allowed size (5MB)")
	}

	ext := strings.ToLower(filepath.Ext(key))
	validTypes, ok := allowedMime[ext]
	if !ok {
		return "", errors.New("unsupported file extension")
	}

	head := make([]byte, 512)
	n, err := io.ReadFull(r, head)
	if err != nil && !errors.Is(err, io.ErrUnexpectedEOF) {
		return "", errors.New("unable to read file header")
	}
	head = head[:n]

	detectedMime := http.DetectContentType(head)
	isMimeValid := false
	for _, v := range validTypes {
		if strings.HasPrefix(detectedMime, v) {
			isMimeValid = true
			break
		}
	}
	if !isMimeValid {
		return "", fmt.Errorf("mime mismatch: detected %s for extension %s", detectedMime, ext)
	}

	cleanKey := filepath.Clean(key)
	if strings.Contains(cleanKey, "..") {
		return "", errors.New("directory traversal detected")
	}

	destPath := filepath.Join(s.baseDir, cleanKey)
	if err := os.MkdirAll(filepath.Dir(destPath), 0750); err != nil {
		return "", err
	}

	f, err := os.OpenFile(destPath, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		if os.IsExist(err) {
			return "", errors.New("file already exists")
		}
		return "", err
	}
	defer f.Close()

	combined := io.MultiReader(bytes.NewReader(head), r)
	if _, err := io.Copy(f, combined); err != nil {
		return "", err
	}

	return cleanKey, nil
}

func (s *LocalStorage) Open(ctx context.Context, key string) (io.ReadCloser, int64, string, error) {
	cleanKey := filepath.Clean(key)
	if strings.Contains(cleanKey, "..") {
		return nil, 0, "", errors.New("invalid file key")
	}
	path := filepath.Join(s.baseDir, cleanKey)
	f, err := os.Open(path)
	if err != nil {
		return nil, 0, "", domain.ErrNotFound
	}
	fi, err := f.Stat()
	if err != nil {
		f.Close()
		return nil, 0, "", err
	}
	ext := strings.ToLower(filepath.Ext(key))
	types := allowedMime[ext]
	mime := "application/octet-stream"
	if len(types) > 0 {
		mime = types[0]
	}
	return f, fi.Size(), mime, nil
}

